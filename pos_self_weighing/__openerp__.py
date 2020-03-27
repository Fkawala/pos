# -*- coding: utf-8 -*-
# @author: François Kawala
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    'name': "Point of Sale - Self weighing ",
    'version': '9.0.0.0.1',
    'category': 'Point of Sale',
    'summary': """Point of Sale - Self service weighing station for loose\
                  goods.""",
    'author': "Le Nid, Odoo Community Association (OCA)",
    'website': "https://github.com/OCA/pos",
    'license': 'AGPL-3',
    'maintainers': ['fkawala'],
    'depends': ['point_of_sale', 'pos_barcode_tare'],
    'demo': ['demo/pos_self_weighing_demo.xml'],
    'data': [
        'views/assets.xml',
        'views/pos_config_view.xml'
    ],
    'qweb': [
        'static/src/xml/pos_self_weighing.xml',
    ],
    'installable': True,
}
