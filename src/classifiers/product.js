const regex = new RegExp( 
    "^"    
    // non capturing group
    + "(?:"
    +   "(?:"
            // most products
            // <group #1 - last two letters of SKU - e.g. CY>_<a possible letter><a digit><3 digits><capture group #1>
    +       "([A-Z]{2})_[A-Z]?[1-9][0-9]{3}\\1" 
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
            // <group #2 - two letters>_<a possible letter><a digit><3 digits><capture gorup #2>
    +       "([A-Z]{2})_[A-Z]?[1-9][0-9]{3}\\2"
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

    return {
        type
    }
    // return object with appropriate data (e.g. sku, size, etc)
}
export default classify;