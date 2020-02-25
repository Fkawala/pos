# -*- coding: utf-8 -*-
# @author: François Kawala
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    'name': "Point of Sale - Self weighting ",
    'version': '9.0.0.0.1',
    'category': 'Point of Sale',
    'summary': """Point of Sale - Get a self service weighting station.""",
    'author': "Le Nid, Odoo Community Association (OCA)",
    'website': "https://github.com/OCA/pos",
    'license': 'AGPL-3',
    'depends': ['point_of_sale'],
    'maintainers': ['fkawala'],
    'depends': ['pos_barcode_tare', 'base_fontawesome'],
    'data': [
        'pos_self_weighting.xml',
        'views/pos_config_view.xml'
    ],
    'qweb': [
        'static/src/xml/pos_self_weighting.xml',
    ],
    'installable': True,
}
