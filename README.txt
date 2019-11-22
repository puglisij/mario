Mario 
--------------
Mario is built using:

HTML5 
CSS/SCSS 
Javascript CS6 
Vue.js  

For a full list of packages utilized, see the package.json 
Conscious effort was made to minimize the number of 3rd party libraries used in order to keep the 
plugin performant, and easier to debug. 



Getting Started
--------------
Its easiest to develop if you add a symbolic link to:
C:/Users/<user>/AppData/Roaming/Adobe/CEP/extensions  
and point it to the repo directory. 

Note: Photoshop will need restarted in order to find new plugins added to the extensions directory. 

1) git clone http://g1vptfs02:8080/tfs/FMG/Web/_git/web-mario
2) mklink /D C:/Users/<user>/AppData/Roaming/Adobe/CEP/extensions/web-mario C:/Projects/web-mario 
3) cd web-mario 
4) npm install 
5) npm run serve 
6) Open Photoshop. Open Mario panel via Window > Extensions > Mario 
7) Open a Chrome tab and visit http://localhost:8089/ if you wish to develop
8) Do awesome things. Add solutions to any encountered issues to this Readme


Glossary
--------------
Pipeline - a series of JSX/Photoshop actions to be performed on an IMAGE. 
IMAGE - refers to an image ready for processing/being processed. Pipelines dont require a 
        working/starter image but in general either a working 'image' or 'package' will be provided. 
        For the current IMAGE in process, an instance of ImageForProcessing class is assigned to 
        the global 'IMAGE' variable on the jsx side. This object contains any data from json, as 
        well as the 'image' path, and 'package' path.
Working Image - generally the image that is opened at the start of a pipeline. 
        This can either be either: 
        * a file created deliberately by a pipeline action 
        * a file opened deliberately by a pipeline action. Such as the one given by the 'image' path property in the JSON. 
        * an image file that was dropped into a watch folder which watches for images (not json) 
Package - a directory containing other images required by a pipeline for processing. 
        Specified as the 'package' property in the JSON.


Pipelines
--------------
A configurable series of JSX actions to be performed on an IMAGE. 
This is configurable via Mario's UI. 
* Currently only linear configurations can be created via the UI. For pipelines requiring loops, 
or other types of control flow, a custom action is necessary. 
Actions may call other actions from within themselves. 


Actions 
--------------
Actions MUST have the same name and casing as their functions. 
Actions are defined in the directory /public/actions 
Only one action is defined per .jsx file 
Actions within the root /public/actions directory are defined on the 'action' namespace
Actions within other subdirectories are defined on the namespace corresponding to the folder structure. 
For example, an action at /public/actions/foo/bar.jsx  will be defined as foo.bar = function bar(){...}; 
Action functions can either receive a single primitive value, or an options object with key/value pairs. 

Conventions: 
- Actions that have no business specific logic or data references will be defined in the 
  root /actions directory. For example, action.saveDocument() which just saves the active document. 
  These types of actions can be thought of as 'Augmenting' Photoshop functionality which isnt availble 
  via their existing jsx API. For example, adding a drop shadow to a layer. 
- Business specific actions should be defined in other subdirectories. 
  Its recommended that actions specific to a particular Pipeline should be defined in a 
  subdirectory by that Pipeline name. 



Input JSON 
--------------
Optional json file. 
Contains data needed for a pipeline in order for a particular IMAGE to be processed. 
'type' - (optional) the type indicating the pipeline(s) that will process the IMAGE. 
'image' - (optional) a path to the Working Image used in the pipeline. Generally opened at the very start. 
'package' - (optional) a path to the Package folder containing other images used by the pipeline. 
All other data will be made available on the IMAGE instance on the photoshop jsx side. 


Input Methods
--------------
REST:
- Currently the REST api is not setup to stream images/data for processing 

File Watching:
- Mario can be configured to watch specific directories for new images to process. 
  Files in subdirectories are ignored by the watcher.
  There are a few options:
  > Watch for json files 
    See JSON description for info on image paths necessary for processing.
  > Watch for images 
    Looks for json file containing data by the same name as the image. Ok if none found.  


Logging 
--------------
If an exception occurs in the JSX while a pipeline is running, the current IMAGE (including anything at 'image' or 'package') 
will be moved within an error directory (Error_<type>) in the watched directory. 
An error message describing the exception will also be logged within the directory. 


Outputs 
--------------
IMAGEs which are successfully processed will be moved into a processed 
directory (Processed_<type>) in the watched directory.


IMAGE
--------------
Note that private variables start with an underscore _  and should not be modified/accessed by actions. 
Available properties are as follows:
- None 
Available methods are:
- getType() returns the 'type' of the image being processed 
- getImagePath() returns the image path given by 'image' in the json 
- getPackagePath() returns the package path given by 'package' in the json 
- data() getter for retreiving json data properties. 
- hasKeyword() can be used to check if a keyword exists in the 'imagePath' XMP metadata 
- context() can be used to get or set context variables required by other actions in the pipeline 
- parameters() fills in mustache template strings {{ key }} data by the key 


JSX 
------------------
Polyfils: 
Currently the Adobe jsx engine is built on an old version of the JS standard. Many functions such as Array.prototype.forEach 
are not available. If any standard function is not available, a polyfil can often be added to the 
at /public/polyfil.jsx which is imported when Mario is opened. 

Utilities: 
Utility functions can be added to the file at /public/utils.jsx 
These are made available on the global underscore _  object. 
Utilities are functions that might assist the development of Actions. 
For example, string templating functions or geometry calculations. 


Roadmap 
--------------
- Add Rete.js visual node based editor for more powerful editing of pipeline logic / flow via the GUI. 
- Parse jsx action JSDoc comments and use data in building existing action selection interface in the UI. 
- A better Readme.md 


Other Resources 
----------------
Great post on modifying data in child components 
https://antenna.io/blog/2018/01/state-management-in-vue-js/