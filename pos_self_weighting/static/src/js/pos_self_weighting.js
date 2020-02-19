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

    var QWeb = core.qweb;

    // XX
    var SelfWeightingWidget = screens.ProductScreenWidget.include({
        template:'SelfWeightingScreenWidget',
//
//        start: function(){
//
//            var self = this;
//
//            this.actionpad = new ActionpadWidget(this,{});
//            this.actionpad.replace(this.$('.placeholder-ActionpadWidget'));
//
//            this.numpad = new NumpadWidget(this,{});
//            this.numpad.replace(this.$('.placeholder-NumpadWidget'));
//
//            this.order_widget = new OrderWidget(this,{
//                numpad_state: this.numpad.state,
//            });
//            this.order_widget.replace(this.$('.placeholder-OrderWidget'));
//
//            this.product_list_widget = new ProductListWidget(this,{
//                click_product_action: function(product){ self.click_product(product); },
//                product_list: this.pos.db.get_product_by_category(0)
//            });
//            this.product_list_widget.replace(this.$('.placeholder-ProductListWidget'));
//
//            this.product_categories_widget = new ProductCategoriesWidget(this,{
//                product_list_widget: this.product_list_widget,
//            });
//            this.product_categories_widget.replace(this.$('.placeholder-ProductCategoriesWidget'));
//
//            this.action_buttons = {};
//            var classes = action_button_classes;
//            for (var i = 0; i < classes.length; i++) {
//                var classe = classes[i];
//                if ( !classe.condition || classe.condition.call(this) ) {
//                    var widget = new classe.widget(this,{});
//                    widget.appendTo(this.$('.control-buttons'));
//                    this.action_buttons[classe.name] = widget;
//                }
//            }
//            if (_.size(this.action_buttons)) {
//                this.$('.control-buttons').removeClass('oe_hidden');
//            }
//        },
//
//        click_product: function(product) {
//           if(product.to_weight && this.pos.config.iface_electronic_scale){
//               this.gui.show_screen('scale',{product: product});
//           }else{
//               this.pos.get_order().add_product(product);
//           }
//        },
//
//        show: function(reset){
//            this._super();
//            if (reset) {
//                this.product_categories_widget.reset_category();
//                this.numpad.state.reset();
//            }
//            if (this.pos.config.iface_vkeyboard && this.chrome.widget.keyboard) {
//                this.chrome.widget.keyboard.connect($(this.el.querySelector('.searchbox input')));
//            }
//        },
//
//        close: function(){
//            this._super();
//            if(this.pos.config.iface_vkeyboard && this.chrome.widget.keyboard){
//                this.chrome.widget.keyboard.hide();
//            }
//        },
    });

    gui.define_screen({name:'selfWeighting', widget: SelfWeightingWidget});

//    if(this.pos.config.iface_self_weight) {
//        gui.set_default_screen('selfWeighting');
//    }
});
