Move these to README.md

Great post on modifying data in child components 
https://antenna.io/blog/2018/01/state-management-in-vue-js/

Its easiest to develop if you add a symbolic link to:
C:/Users/<user>/AppData/Roaming/Adobe/CEP/extensions  
and point it to the repo directory. 

Note: Photoshop will need restarted in order to find new plugins added to the extensions directory. 


Glossary
----------
Pipeline - a series of JSX/Photoshop actions to be performed on an IMAGE. 
IMAGE - refers to an image ready for processing/being processed. Pipelines dont require a 
        working/starter image but in general either a working 'image' or 'package' will be provided. 
Working Image - generally the image that is opened at the start of a pipeline. Appears as the
        'image' property in the JSON. 
Package - a directory containing other images required by a pipeline for processing. Appears as the
        'package' property in the JSON.


Pipelines
----------


Input JSON 
--------------
Data required for a pipeline is given via a JSON file for a particular IMAGE being processed. 
'type' - (optional) 
'image' - (optional)
'package' - (optional)


Input Methods
--------------
REST:
- Currently the REST api is not setup to stream images/data for processing 

File Watching:
- Mario can be configured to watch specific directories for new images to process. Files in subdirectories are ignored by the watcher.
  There are a few options:
  > Watch for json files  
    Any images required for the pipeline are found in a folder specified by the 'package' property in the json
  > Watch for images 
    Looks for json file containing data by the same name as the image 


Actions 
--------------
Actions MUST have the same name and casing as their functions 
