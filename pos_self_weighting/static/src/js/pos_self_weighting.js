odoo.define('pos_self_weighting.screens', function (require) {

    "use strict";
    var chrome = require('point_of_sale.chrome');
    var core = require('web.core');
    var devices = require('point_of_sale.devices');
    var gui = require('point_of_sale.gui');
    var models = require('point_of_sale.models');
    var screens = require('point_of_sale.screens');
    var utils = require('web.utils');
    var formats = require('web.formats');
    var tare = require('pos_barcode_tare.screens');

    var _t = core._t;
    var QWeb = core.qweb;

    var SelfServiceScaleScreenWidget = screens.ScaleScreenWidget.extend({
        next_screen: 'selfProducts',
        previous_screen: 'selfProducts',

        show: function() {
            this._super();
            var self = this;
            var product = this.get_product();
            var tare_code = this.get_tare_code();
            this.$('.next,.buy-product').off('click').click(function(){
            // this reset the screen params so that we do not apply the tare
            // twice
            self.gui.show_screen(self.next_screen, {});
            // add product *after* switching screen to scroll properly
            self.order_product(product, tare_code);
        });
        },

        get_tare_code: function(){
            return this.gui.get_current_screen_param('tare_code');
        },
        order_product: function(product, tare_code){
        var order = this.pos.get_order();

        order.add_product(product,{ quantity: this.weight });

        if (tare_code) {
        var tare_weight = tare_code.value;

        var orderline = order.get_last_orderline();
        orderline.set_tare(tare_weight);

        }

    }


    });

    var SelfServiceTareScreenWidget = tare.TareScreenWidget.extend({
        next_screen: 'selfService',
        previous_screen: 'selfService',
    });

    var SelfServiceWidget = screens.ScreenWidget.extend({
        template:'SelfServiceWidgetHome',
        next_screen: 'selfService',
        previous_screen: 'selfService',

        renderElement: function() {
            var self = this;
            this._super();
             this.$('.tare').click(function(){
                self.gui.show_screen('selfTare');
            });
            this.$('.weight').click(function(){
                self.gui.show_screen('selfProducts');
            });
            this.$('.scan').click(function(){
                self.gui.show_screen('selfScan');
            });
        }
    });

    var SelfServiceScanScreenWidget = screens.ScreenWidget.extend({
        template:'SelfServiceTareScanWidget',
        next_screen: 'selfProducts',
        previous_screen: 'selfService',

        renderElement: function () {
            this._super();
            var self = this;
            this.$('.back').click(function () {
                self.gui.show_screen(self .previous_screen);
            });
        }
    });

    var SelfServiceSearchWidget = screens.ScreenWidget.extend({
        template:'SelfServiceSearchWidget',
        init: function(parent, options) {
            var self = this;
            this._super(parent, options);
            this.category = this.pos.db.get_category_by_id(this.pos.db.root_category_id);
            this.product_list_widget = options.product_list_widget || null;

            var search_timeout  = null;
            this.search_handler = function(event){
            if(event.type == "keypress" || event.keyCode === 46 || event.keyCode === 8){
                clearTimeout(search_timeout);

                var searchbox = this;

                search_timeout = setTimeout(function(){
                    self.perform_search(self.category, searchbox.value, event.which === 13);
                },70);
            }};
        },
        renderElement: function() {
            var self = this;
            this._super();

            var search_box = this.el.querySelector('.searchbox input');
            search_box.addEventListener('keypress',this.search_handler);
            search_box.addEventListener('keydown',this.search_handler);
        },
        perform_search: function(category, query, buy_result){
            var products;
            if(query){
                products = this.pos.db.search_product_in_category(category.id,query);
                if(buy_result && products.length === 1){
                        var product_id = products[0].id
                        // Triggers the click product action in order to display
                        // the scale screen instead of simply adding the product
                        // to the order.
                        this.product_list_widget.click_product_handler(null, product_id);
                        this.clear_search();
                }else{
                    this.product_list_widget.set_product_list(products);
                }
            }else{
                products = this.pos.db.get_product_by_category(this.category.id);
                this.product_list_widget.set_product_list(products);
            }
        },
        clear_search: function(){
            var products = this.pos.db.get_product_by_category(this.category.id);
            this.product_list_widget.set_product_list(products);
            var input = this.el.querySelector('.searchbox input');
                input.value = '';
                input.focus();
        }
    });

    var SelfServiceProductListWidget = screens.ProductListWidget.extend({

        init: function(parent, options) {
            this._super(parent, options)
            var self = this;
            this.click_product_handler = function(event, product){

                var product_id = product || this.dataset.productId;
                var product = self.pos.db.get_product_by_id(product_id);
                options.click_product_action(null, product)
            };
        },
        renderElement: function() {
            var el_str  = QWeb.render(this.template, {widget: this});
            var el_node = document.createElement('div');
                el_node.innerHTML = el_str;
                el_node = el_node.childNodes[1];

            if(this.el && this.el.parentNode){
                this.el.parentNode.replaceChild(el_node,this.el);
            }
            this.el = el_node;

            var list_container = el_node.querySelector('.product-list');
            for(var i = 0, len = this.product_list.length; i < len; i++){
                var product = this.product_list[i];
                // We are displaying only products that need to be weighted to
                // be sold.
                if (product.to_weight) {
                    var product_node = this.render_product(product);
                    product_node.addEventListener('click',this.click_product_handler);
                    list_container.appendChild(product_node);
                }
            }
        },

    });

    var SelfServiceActionpadWidget = screens.ActionpadWidget.extend({
        template:'SelfServiceActionpadWidget',
        init: function (parent, options) {
            this._super(parent, options);
            this.order_widget = options.order_widget;
            this.price_labels = options.price_labels;
        },
        renderElement: function() {
            var self = this;
            this._super();
            this.$('.back').click(function(){
                var order = self.pos.get_order();
                var orderline = order.get_selected_orderline();

                if (orderline) {
//                    self.order_widget.orderline_remove(orderline);
                    order.remove_orderline(orderline);
//                    self.order_widget.update_summary();
                }

                if ( order.orderlines.length == 0) {
                    // Go back to the default screen when there is nothing left
                    // to remove from the current order.
                    self.gui.show_screen('selfService');
                } else {
                    self.order_widget.renderElement()
                }
            });
            this.$('.print').click(function(){
                self.price_labels.renderElement();

                window.print();

                self.gui.show_screen('selfService');
                self.pos.delete_current_order();
            });
        }
    });

        var PriceLabelsWidget = screens.ScreenWidget.extend({
        template:'PosPriceLabels',

        init: function(parent, options) {
            this._super(parent,options);
            this.pos.bind('change:selectedOrder', this.bind_order_events, this);
                    if (this.pos.get_order()) {
            this.bind_order_events();
        }
        },
        bind_order_events: function() {
          if (this.pos.get_order()) {
            var lines = this.pos.get_order().orderlines;
            lines.unbind('add',     this.renderElement,    this);
            lines.bind('add',       this.renderElement,    this);
            lines.unbind('remove',  this.renderElement, this);
            lines.bind('remove',    this.renderElement, this);
            lines.unbind('change',  this.renderElement, this);
            lines.bind('change',    this.renderElement, this);
            }
        },

        renderElement: function() {
        this._super();

        var order = this.pos.get_order();
             this.$(".labels").html( QWeb.render("PosLabels",{
                widget:this,
                orderlines: order.get_orderlines(),

            }));
    },
    });


    var SelfServiceProduct = screens.ProductScreenWidget.extend({
        template:'SelfServiceProduct',
        next_screen: 'selfService',
        previous_screen: 'selfService',

        start: function(){
            var self = this;
            this.order_widget = this.gui.screen_instances["products"].order_widget;
            this.product_list_widget = new SelfServiceProductListWidget(this,{
                click_product_action: function(event, product){ self.click_product(product); },
                product_list: this.pos.db.get_product_by_category(0)
            });
            this.search_widget = new SelfServiceSearchWidget(this,{product_list_widget: this.product_list_widget});
            this.price_labels = new PriceLabelsWidget(this, {order_widget: this.order_widget});

            this.actionpad = new SelfServiceActionpadWidget(this,{order_widget: this.order_widget, price_labels: this.price_labels});

            if (this.pos.config.iface_self_weight) {
                this.order_widget.replace(this.$('.placeholder-OrderWidget'));
                this.product_list_widget.replace(this.$('.placeholder-ProductListWidget'));
                this.actionpad.replace(this.$('.placeholder-ActionpadWidget'));
                this.search_widget.replace(this.$('.placeholder-SelfServiceSearchWidget'));
                this.price_labels.replace(this.$('.placeholder-PriceLabelsWidget'));
            }
        },

        get_tare_code: function(){
            return this.gui.get_current_screen_param('tare_code');
        },
        reset_tare_code: function() {
                var order = this.pos.get_order();
        if (order) {
            delete order.screen_data["params"]["tare_code"];
        }},

        click_product: function(product) {

           if(product.to_weight && this.pos.config.iface_electronic_scale){
               var tare_code = this.get_tare_code();

               this.gui.show_screen('selfScale', {product: product, tare_code: tare_code});
           }else{
                var popup = {title: _t("We can not apply this tare barcode."),
                    popup: _t("You did not configured this POS to use the electronic scale. This add-on requires POS to use the scale. Reconfigure the POS to be able to use this add-on.")

                    };
                this.gui.show_popup('error', popup);

           }


        },
        show: function(){
            this._super()
            // Forces the focus on the search box in order to speed up the
            // process.
            this.el.querySelector('.searchbox input').focus();
        },
    });

    var OrderLineWithTareAndBarcode = models.Orderline.extend({

        pad_data: function (padding_size, data){
            var padded = '0'.repeat(padding_size) + data;
            return padded.substr(padded.length - padding_size);
        },
        get_barcode_prefix: function (barcode_rule_name) {
            var barcode_pattern = this.get_barcode_pattern(barcode_rule_name);
            return barcode_pattern.substr(0, 2);
        },
        get_barcode_pattern: function (barcode_rule_name) {
            var rules = this.get_barcode_rules();
            var rule = rules.filter(
                function (r) {
                    // We select the first (smallest sequence ID) barcode rule
                    // with the expected type.
                    return r.type === barcode_rule_name;
                })[0];
            return rule.pattern;
        },
        get_barcode_rules: function () {
            return this.pos.barcode_reader.barcode_parser.nomenclature.rules;
        },
        get_barcode_data: function (){
            // Pad the values to match the EAN13 format.
            var padding_size = 5;
            var product_id = this.pad_data(padding_size, this.product.id);
            var price_in_cents = this.get_price_with_tax() * 100
            var price = this.pad_data(padding_size, price_in_cents);
            // Builds the barcode using a placeholder checksum.
            var barcode = this.get_barcode_prefix("price_to_weight")
                .concat(product_id, price)
                .concat(0);
            // Compute checksum.
            var barcode_parser = this.pos.barcode_reader.barcode_parser;
            var checksum = barcode_parser.ean_checksum(barcode);
            // Replace checksum placeholder by the actual checksum.
            return barcode.substr(0, 12).concat(checksum);
        }
    });

    gui.define_screen({name:'selfService', widget: SelfServiceWidget});
    gui.define_screen({name:'selfTare', widget: SelfServiceTareScreenWidget});
    gui.define_screen({name:'selfScale', widget: SelfServiceScaleScreenWidget});
    gui.define_screen({name:'selfProducts', widget: SelfServiceProduct});
    gui.define_screen({name:'selfScan', widget: SelfServiceScanScreenWidget});

    models.Orderline = OrderLineWithTareAndBarcode

    screens.ScreenWidget.include(
    {
        barcode_tare_action_self_service: function (code) {

        try {
 if (this.pos.config.iface_self_weight) {
                this.gui.show_screen('selfProducts', {tare_code: code});
            } else {
                this.barcode_tare_action(code);
            }
                } catch (error) {
                    var title = _t("We can not apply this tare barcode.");
                    var popup = {title: title, body: error.message};
                    this.gui.show_popup('error', popup);
                }


        },
        // Setup the callback action for the "weight" barcodes.
        show: function () {
            this._super();
            this.pos.barcode_reader.set_action_callback(
                'tare',
                _.bind(this.barcode_tare_action_self_service, this));
        },
    });

    chrome.Chrome = chrome.Chrome.include({
        build_widgets: function(){
            if (this.pos.config.iface_self_weight) {
//                this.widgets.shift();
                this._super();
                this.gui.set_default_screen('selfService');
                this.gui.set_startup_screen('selfService');
            } else {
                this._super();
            }
        },
    });
});
