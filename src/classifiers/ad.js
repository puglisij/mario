const regex = new RegExp(
    "^AD\_[A-Z0-9]{4}\_[A-Z0-9a-z\_]+(?:_[0-9]{2}?)?"
);


function classify(fileName)
{
    let match = regex.exec(fileName);
    if(!match) {
        // cannot classify this type
        return false;
    }
    let type = "Ad";

    return {
        type
    }
}
export default classify;