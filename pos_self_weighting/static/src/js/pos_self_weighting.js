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

//    var ProductSelfService = screens.ProductScreenWidget.extend({
//        template:'ProductScreenWithoutCategories',
//        next_screen: 'selfWeighting',
//        previous_screen: 'selfWeighting',
//
//    })
//
    var SelfWeightingWidget = screens.ScreenWidget.extend({
        template:'SelfWeightingHome',
        next_screen: 'selfWeighting',
        previous_screen: 'selfWeighting',

          start: function(){
//
//        var self = this;
//
//        this.actionpad = new screens.ActionpadWidget(this,{});
//        this.actionpad.replace(this.$('.placeholder-ActionpadWidget'));
//
//        this.numpad = new screens.NumpadWidget(this,{});
//        this.numpad.replace(this.$('.placeholder-NumpadWidget'));
//
//        this.order_widget = new screens.OrderWidget(this,{
//            numpad_state: this.numpad.state,
//        });
//        this.order_widget.replace(this.$('.placeholder-OrderWidget'));
//
//        this.product_list_widget = new screens.ProductListWidget(this,{
//            click_product_action: function(product){ self.click_product(product); },
//            product_list: this.pos.db.get_product_by_category(0)
//        });
//        this.product_list_widget.replace(this.$('.placeholder-ProductListWidget'));

//        this.product_categories_widget = new ProductCategoriesWidget(this,{
//            product_list_widget: this.product_list_widget,
//        });
//        this.product_categories_widget.replace(this.$('.placeholder-ProductCategoriesWidget'));

//        this.action_buttons = {};
//        var classes = screens.action_button_classes;
//        for (var i = 0; i < classes.length; i++) {
//            var classe = classes[i];
//            if ( !classe.condition || classe.condition.call(this) ) {
//                var widget = new classe.widget(this,{});
//                widget.appendTo(this.$('.control-buttons'));
//                this.action_buttons[classe.name] = widget;
//            }
//        }
//        if (_.size(this.action_buttons)) {
//            this.$('.control-buttons').removeClass('oe_hidden');
//        }
    },

        renderElement: function() {
        var self = this;
        this._super();
        this.$('.tare').click(function(){
            self.gui.show_screen('tare');
        });
        this.$('.weight').click(function(){
            self.gui.show_screen('products');
        });
    }
    });

    gui.define_screen({name:'selfWeighting', widget: SelfWeightingWidget});

//    screens.ProductScreenWidget = screens.ProductScreenWidget.include({
//        show: function(reset){
//        this._super();
////        if (reset) {
////            this.product_categories_widget.reset_category();
////            this.numpad.state.reset();
////        }
//    },

//    });
//    var _super_ = chrome.Chrome.prototype;
    chrome.Chrome = chrome.Chrome.include({
        build_widgets: function(){
        if (this.pos.config.iface_self_weight) {
            this.widgets.shift();
            this._super();
            this.gui.set_default_screen('selfWeighting');
            this.gui.set_startup_screen('selfWeighting');

//            this.$('.pos-rightheader')[0].style.removeProperty("left");
//            this.$('.pos-rightheader')[0].style.setProperty("right","440px");

        } else {
            this._super();
        }

        },



    });


//
//    var pos_ready_function = chrome.Chrome.pos.ready.done;
//    chrome.Chrome.pos.ready.done(function(){
//        pos_ready_function();
//        chrome.Chrome.gui.set_default_screen('selfWeighting');
//    });

});
