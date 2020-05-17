# @author: François Kawala
# License AGPL-3.0 or later (http://www.gnu.org/licenses/agpl.html).
{
    'name': "Point of Sale - Tare barecode labels for loose goods",
    'version': '12.0.1.0.0',
    'category': 'Point of Sale',
    'summary': """Point of Sale - Print and scan tare \
                  barecodes labels to sell loose goods.""",
    'author': "Le Nid, Odoo Community Association (OCA)",
    'website': "https://github.com/OCA/pos",
    'license': 'AGPL-3',
    'maintainers': ['fkawala'],
    'depends': ['point_of_sale'],
    'demo': ['demo/pos_tare_demo.xml'],
    'data': [
        'pos_tare.xml',
        'views/pos_config_view.xml',
        'data/barcode_rule.xml',
    ],
    'qweb': [
        'static/src/xml/pos_tare.xml',
    ],
    'installable': True,
}
