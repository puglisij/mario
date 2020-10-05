import ImageFileReader from '../src/server/imageFileReader';
import ImageSource from '../src/server/imageSource';
import ImageSourceType from '../src/server/imageSourceType';
import Image from '../src/server/image';
import uncSafePath from '../src/unc-safe-path';
import path from 'path';
import fs from 'fs';

var chai = require('chai');
var expect = chai.expect;
var should = chai.should();


context('imageFileReader', function()
{
    let _imageFileReader = null;

    it('works', function() {});
    it('should instantiate without errors', function() {
        (function () {
            _imageFileReader = new ImageFileReader()
          }.should.not.throw());
    });

    context('with json file source', function() 
    {
        const _testFilePath = path.resolve("./test/dummy-image-input.json");
        let _imageSource = null;

        before(function() {
            _imageSource = new ImageSource();
            _imageSource.name = "with json source";
            _imageSource.sourceType = ImageSourceType.DIRECTORY;
            _imageSource.sourceDirectory = "";
            _imageSource.sourceExtensions = ["json"];
    
            _imageSource.useOutputDirectory = false;
            _imageSource.outputDirectory = "";
            _imageSource.useProcessedDirectory = false;
            _imageSource.processedDirectory = "";
            _imageSource.useErrorDirectory = false;
            _imageSource.errorDirectory = "";
        });

        /*
            TODO:
                - Test unc input paths are rejected
                - Test invalid input file/permissions
        */

        context('with basic json values', function() 
        {
            before(function() {
                let json = {
                    inputImagePath: "c:/foo",
                    outputDirectory: "",
                    processedDirectory: "",
                    pipelines: "my pipeline 1,my pipeline 2"
                };
                fs.writeFileSync(_testFilePath, JSON.stringify(json));
            });

            it('should read/parse json and return instance of Image', async function() {
                const image = await _imageFileReader.read(_testFilePath, _imageSource);
                expect(image).to.be.an.instanceof(Image);
            });
    
            it('should record correct input paths', async function() {
                const image = await _imageFileReader.read(_testFilePath, _imageSource);
                expect(image.initialInputImagePath).to.equal(_testFilePath);
                expect(image.inputImagePath).to.equal("c:/foo");
                expect(image.inputDirectory).to.equal(uncSafePath.dirname(_testFilePath));
            });
    
            it('can read pipelines as a comma delimited string', async function() {
                const image = await _imageFileReader.read(_testFilePath, _imageSource);
                expect(image.pipelines).to.be.an('array').that.has.members(['my pipeline 1', 'my pipeline 2']);
            });
        });
        
        context('with advanced json values', function() 
        {
            before(function() {
                _imageSource.useOutputDirectory = false;
                _imageSource.useProcessedDirectory = false;
                _imageSource.useErrorDirectory = false;
                _imageSource.outputDirectory = "c:/bad-output";
                _imageSource.processedDirectory = "c:/bad-processed";
                _imageSource.errorDirectory = "c:/bad-error";

                let json = {
                    inputImagePath: "c:/foo/bar.psd",
                    outputDirectory: "c:/foo/output",
                    processedDirectory: "c:/foo/processed",
                    errorDirectory: "c:/foo/error",
                    pipelines: ["my pipeline 1", "my pipeline 2"]
                };
                fs.writeFileSync(_testFilePath, JSON.stringify(json));
            })

            it('can read pipelines as an array', async function() {
                const image = await _imageFileReader.read(_testFilePath, _imageSource);
                expect(image.pipelines).to.be.an('array').that.has.members(['my pipeline 1', 'my pipeline 2']);
            });
            
            it('should read directory preferences and override ImageSource', async function() {
                const image = await _imageFileReader.read(_testFilePath, _imageSource);
                expect(image.outputDirectory).to.equal("c:/foo/output");
                expect(image.processedDirectory).to.equal("c:/foo/processed");
                expect(image.errorDirectory).to.equal("c:/foo/error");
                expect(image.useOutputDirectory).to.be.true;
                expect(image.useProcessedDirectory).to.be.true;
                expect(image.useErrorDirectory).to.be.true;
            });
    
            it('should read metadata for image files when asked', async function() {

            });
        });
    });

    context('with image file source (e.g. psd, jpg, etc)', function() 
    {

    });
});

