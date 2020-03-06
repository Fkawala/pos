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

    var QWeb = core.qweb;

    var SelfServiceScaleScreenWidget = screens.ScaleScreenWidget.extend({
        next_screen: 'selfWeighting',
        previous_screen: 'selfWeighting',
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
                self.gui.show_screen('selfWeighting');
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
        },
        renderElement: function() {
            var self = this;
            this._super();
            this.$('.back').click(function(){
                var order = self.pos.get_order();
                var orderline = order.selected_orderline;

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
                window.print();
                self.gui.show_screen('selfService');
            });
        }
    });



    var SelfServiceProduct = screens.ProductScreenWidget.extend({
        template:'SelfServiceProduct',
        next_screen: 'selfWeighting',
        previous_screen: 'selfWeighting',

        start: function(){
            var self = this;
            this.order_widget = this.gui.screen_instances["products"].order_widget;
            this.product_list_widget = new SelfServiceProductListWidget(this,{
                click_product_action: function(event, product){ self.click_product(product); },
                product_list: this.pos.db.get_product_by_category(0)
            });
            this.search_widget = new SelfServiceSearchWidget(this,{product_list_widget: this.product_list_widget});

            this.actionpad = new SelfServiceActionpadWidget(this,{order_widget: this.order_widget});

            if (this.pos.config.iface_self_weight) {
                this.order_widget.replace(this.$('.placeholder-OrderWidget'));
                this.product_list_widget.replace(this.$('.placeholder-ProductListWidget'));
                this.actionpad.replace(this.$('.placeholder-ActionpadWidget'));
                this.search_widget.replace(this.$('.placeholder-SelfServiceSearchWidget'));
                $
            }
        },
        click_product: function(product) {
           if(product.to_weight && this.pos.config.iface_electronic_scale){
               this.gui.show_screen('selfScale',{product: product});
           }else{
               this.pos.get_order().add_product(product);
           }
        },
        show: function(){
            this._super()
            // Forces the focus on the search box in order to speed up the
            // process.
            this.el.querySelector('.searchbox input').focus();
        },
    });

    gui.define_screen({name:'selfService', widget: SelfServiceWidget});
    gui.define_screen({name:'selfTare', widget: SelfServiceTareScreenWidget});
    gui.define_screen({name:'selfScale', widget: SelfServiceScaleScreenWidget});
    gui.define_screen({name:'selfWeighting', widget: SelfServiceProduct});

    chrome.Chrome = chrome.Chrome.include({
        build_widgets: function(){
            if (this.pos.config.iface_self_weight) {
                this.widgets.shift();
                this._super();
                this.gui.set_default_screen('selfService');
                this.gui.set_startup_screen('selfService');
            } else {
                this._super();
            }
        },
    });
});
