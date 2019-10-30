// function getLayerStyles(layerDesc)
// {
//     // layerDesc optional - allows getting styles by index, id, or name. default is activeLayer
//    if(layerDesc == undefined)
//    {
//         var ref = new ActionReference();
//             ref.putEnumerated(
//                 c2t("Lyr "), 
//                 c2t( "Ordn" ), 
//                 c2t( "Trgt" ));
//         layerDesc = executeActionGet(ref);
//    }
//     if(layerDesc.hasKey(s2t('layerEffects')))
//     {
//         stylesDesc = layerDesc.getObjectValue(s2t('layerEffects'));
//         var styles = {};
//             styles.toString = function() { return 'LayerStyles'; }
//             styles.count = 0;

//         if(stylesDesc.hasKey( s2t('frameFX') )) 
//         {
//             styles['stroke'] = stylesDesc.getObjectValue(s2t('frameFX')); 
//             styles.count++;

//             var amStyle = typeIDToStringID(
//                     styles['stroke'].getEnumerationValue(c2t('Styl'))
//                 )
//                 .replace('Frame', '');

//             switch (amStyle) {
//                 case 'outset': styles['stroke'].style = 'Outside'; break;
//                 case 'inset': styles['stroke'].style = 'Inside'; break;
//                 case 'centered': styles['stroke'].style = 'Center'; break;
//             }
//             // set other needed properties
//         }
//         /*
//             additional if block for the other effects you need
//         */
//         return styles;
//    }
// }


// var ref = new ActionReference();
//     ref.putEnumerated( c2t("Lyr "), c2t("Ordn"), c2t("Trgt") );
// var layerDesc = executeActionGet(ref);
// var effectsDesc = layerDesc.getObjectValue(s2t('layerEffects'));
//     checkDesc2 (effectsDesc);
// var dropShadow = effectsDesc.getObjectValue(s2t('dropShadow'));
//     checkDesc2 (dropShadow);

// function checkDesc (theDesc) 
// {
//     var c = theDesc.count;
//     var str = '';
//     for(var i=0;i<c;i++) { //enumerate descriptor's keys
//         str = str + 'Key ' + i + ' = ' + typeIDToStringID(theDesc.getKey(i)) + ': ' + theDesc.getType(theDesc.getKey(i))+'\n';
//     };
//     alert("desc\n\n"+str);
// };
// ////// based on code by michael l hale //////
// function checkDesc2 (theDesc) 
// {
//     var c = theDesc.count;
//     var str = '';
//     for(var i = 0; i < c; i++) { //enumerate descriptor's keys
//         str = str + 'Key ' 
//         + i + ' = ' 
//         + typeIDToStringID(theDesc.getKey(i)) 
//         + ': ' + theDesc.getType(theDesc.getKey(i))
//         + '\n' + getValues(theDesc, i) + '\n';
//     };
//     alert("desc\n\n"+str);
// };
// ////// check //////
// function getValues (theDesc, theNumber) 
// {
//     switch (theDesc.getType(theDesc.getKey(theNumber)))
//     {
//         case DescValueType.BOOLEANTYPE:
//             return theDesc.getBoolean(theDesc.getKey(theNumber));
//         break;
//         case DescValueType.CLASSTYPE:
//             return theDesc.getClass(theDesc.getKey(theNumber));
//         break;
//         case DescValueType.DOUBLETYPE:
//             return theDesc.getDouble(theDesc.getKey(theNumber));
//         break;
//         case DescValueType.ENUMERATEDTYPE:
//             return (typeIDToStringID(theDesc.getEnumerationValue(theDesc.getKey(theNumber)))+"_"+typeIDToStringID(theDesc.getEnumerationType(theDesc.getKey(theNumber))));
//         break;
//         case DescValueType.INTEGERTYPE:
//             return theDesc.getInteger(theDesc.getKey(theNumber));
//         break;
//         case DescValueType.LISTTYPE:
//             return theDesc.getList(theDesc.getKey(theNumber));
//         break;
//         case DescValueType.OBJECTTYPE:
//             return (theDesc.getObjectValue(theDesc.getKey(theNumber))
//                     + "_"
//                     + typeIDToStringID(
//                         theDesc.getObjectType(theDesc.getKey(theNumber))
//                     )
//                 );
//         break;
//         case DescValueType.REFERENCETYPE:
//             return theDesc.getReference(theDesc.getKey(theNumber));
//         break;
//         case DescValueType.STRINGTYPE:
//             return theDesc.getString(theDesc.getKey(theNumber));
//         break;
//         case DescValueType.UNITDOUBLE:
//             return (theDesc.getUnitDoubleValue(theDesc.getKey(theNumber)) 
//                     + "_" 
//                     + typeIDToStringID(
//                         theDesc.getUnitDoubleType(theDesc.getKey(theNumber))
//                     )
//                 );
//         break;
//         default:
//         break;
//     };
// };