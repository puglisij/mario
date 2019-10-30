/**
* Adds keyword "PackDupe" if child skus exist and keyword "DONOTPCDUPE" doesn't exist
*/
product.addKeyword_PackDupe = function addKeyword_PackDupe()
{
    if(!_.hasKeyword("DONOTPCDUPE") && IMAGE.get("childSkus")) {
        _.addKeyword("PackDupe");
    }
}