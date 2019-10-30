const regex = new RegExp( 
    "^"    
    // non capturing group
    + "(?:"
    +   "("
            // most products
            // <group #2 - last two letters of SKU - e.g. CY>_<a possible letter><a digit><3 digits><capture group #1>
    +       "([A-Z]{2})_[A-Z]?[1-9][0-9]{3}\\2" 
            // ~or~  DB_<4 digits><SBL|L|V|K>
    +       "|DB_[0-9]{4}(?:SBL|L|V|K)"
            // ~or~  JK_JK<1 digit><3 digits><a specific letter>
    +       "|JK_JK[1-9][0-9]{3}[A-HJ-NP-Z]{1}"
    +   ")"  
    +   "_"
    + ")*" 
    // non capturing group
    + "(?:"
    +   "(?:"
            // <group #3 - two letters>_<a possible letter><a digit><3 digits><capture gorup #2>
    +       "([A-Z]{2})_[A-Z]?[1-9][0-9]{3}\\3"
            // ~or~  DB_<4 digits><SBL|L|V|K>
    +       "|DB_[0-9]{4}(?:SBL|L|V|K)"
            // ~or~  JK_JK<1 digit><3 digits><a specific letter>
    +       "|JK_JK[1-9][0-9]{3}[A-HJ-NP-Z]{1}" 
    +   ")"
    +   "_"  
        // non capturing group 
    +   "(?:"
            // PS<a possible digit>
    +       "PS[1-9]?"
            // ~or~  MODEL<a possible digit>
    +       "|MODEL[1-9]?" 
            // ~or~  INSET extensions don't need letter suffixes 
    +       "|INSET[1-9]?"     
            // ~or~  
    +       "|(?:"
                // <a letter><possible 1+ digits><possible _ and digits><possible _INSET and digit>
    +           "[A-Z](?:[0-9]+)?(?:_[1-9][0-9]*)?(?:_INSET[1-9]?)?"
    +       ")"
    +   ")"
        // possible _MERGE<a possible digit>
    +   "(?:_MERGE[1-9]?)?"
        // possible _MASK
    +   "(?:_MASK)?"
        // possible _REF
    +   "(?:_REF)?"
    + ")"
    // Archive only extensions to allow for color space specific targeted color correction
    + "(?:_(?:RGB|CMYK))?" 
    // Filename extension (this is a screwy way of matching psds and jpegs)
    + "(?:\\.[pPjJ][sSpP][dDgG])?"  
    +"$"  
);

function createSearchTag(parentName)
{
    if (parentName.match(/EMNJ_/)) {
        finderComment = parentName.match(/EMNJ_[^_]+/).toString()
        SKUadd = "2 EMNJ/" + finderComment
    }
    if(parentName.match(/BMB_/)) {
        finderComment = parentName.match(/BMB_[0-9A-Z]{6}/).toString()
        SKUadd = "2 EMNJ/" + finderComment
    }
    if (parentName.match(/EDITS/i)) {
        finderComment = "1 Photo Orders/Misc.EDITS"
        SKUadd = finderComment
    }
    if(parentName.match(/force/)) {
        finderComment = "WebRedo"
        SKUadd = "3 New Product/" + finderComment
    }
    if(parentName.match(/SWAR_/)) {
        finderComment = parentName.match(/SWAR/).toString()
        SKUadd = "0 Swarovski/" + finderComment
    }
    if (parentName.match(/[0-9]{2}\.[0-9]{2}\.[0-9]{2}_[0-9]{5}_[IRPGCCQ_]+/)) {
        finderComment = parentName.match(/[0-9]{2}\.[0-9]{2}\.[0-9]{2}_[0-9]{5}/).toString()
        SKUadd = "1 Photo Orders/" + finderComment
        POfolder = true
    }
    if (parentName.match(/^[0-9]{4}_/)) {
        finderComment = parentName.match(/^[0-9]{4}/).toString()
        SKUadd = "3 New Product/" + finderComment
    }
    if (parentName.match(/^CELESTIAL_/i)){
        finderComment = parentName.match(/CELESTIAL/i).toString()
        SKUadd = "3 New Product/" + finderComment
    }

    if (parentName.match(/EMNJ_/)) {
        finderComment = parentName.match(/EMNJ_[^_]+/).toString()
    }
    if (parentName.match(/[0-9]{2}\.[0-9]{2}\.[0-9]{2}_[0-9]{5}_[IRPGCCQ_]+/)) {
        finderComment = parentName.match(/[0-9]{2}\.[0-9]{2}\.[0-9]{2}_[0-9]{5}_[IRPGCCQ_]+/).toString()
    }
}
function getSKU()
{
    try {
        var SKU = newDocument.name.match(/[0-9]{4}SBL|[A-Z]?[0-9]{4}[A-Z]{2}|COH[0-9]{4}|/).toString();
    } catch (err) {

        if (newDocument.name.match(/^DB_/)) {
            //alert("newDocument name Matched DB!")
            var SKU = "DB" + newDocument.name.match(/[0-9]{4}SBL|[A-Z]?[0-9]{4}[A-Z]+/).toString();
        } else {
            //alert("newDocument name matched silly one off stuff!")
            var SKU = "JK" + newDocument.name.match(/[1-9][0-9]{3}[A-HJ-NP-Z]{1}/).toString();
        }
    }
}

function productLookup()
{
    // GET http://g1ppwebapp01/product_lookup/Default.asp?ITEM_NUMBER=" + SKU
}


// TODO Create DataCollector pattern instead with different types of data collectors (file name parser, metadata reader, image order flat file reader, etc)
//      DataCollectors will be run by Image Reader to aggregate data.
//      Classifier should only be used for indicating Pipeline or may not be needed at all
function classify(fileName)
{
    let match = regex.exec(fileName);
    if(!match) {
        // cannot classify this type
        return false;
    }
    let type = "Product";
    let sku = "";
    let isInset = false; 
    let isModel = false;
    let suffix = "";
    let colorSpace = "";
    let parentName = ""; // parent folder
    let illustratedUseShots = []; // mdfind -onlyin '/Volumes/photostore/RGB_Archive/' 'kMDItemDisplayName == \"*" + codeID + "_" + COHId + "*\"cd' | grep [.] | grep -v 'MERGE\\|MASK\\|REF\\|READ' 
    let productShots = []; // mdfind -onlyin '/Volumes/photowork/' 'kMDItemDisplayName == \"*" + SKU + "*\"cd' | grep [.] | grep -v 'MERGE\\|MASK\\|REF\\|cof\\|cop'
    return {
        type
    }
    // return object with appropriate data (e.g. sku, size, etc)
}
export default classify;