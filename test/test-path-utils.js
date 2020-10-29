import uncSafePath from '../src/unc-safe-path';

var chai = require('chai');
var expect = chai.expect;
var should = chai.should();

describe('path utilities', function()
{
    const IS_ANCESTOR_TESTS = [
        ["C:/foo_bar", "c:\\foo\\bar", false],
        ["C:/Foo", "c:\\foo\\bar", true],
        ["d:/foo/Bar", "d:/foo/bar/Buzz", true],
        ["d:/foo", "c:\\foo\\bar", false],
        ["c:/foo/bar", "c:\\foo\\bar", true],
        ["c:/foo/bar/buzz", "c:\\foo\\bar", false],
        ["c:\\foo\\bar", "c:/foo/bar/buzz", true],
        ["c:\\foo_", "c:/foo/Bar/buzz", false],
        ["c:\\foo_", "c:/foo/bar/buzz/zip.psd", false],
        ["c:\\foo", "c:/foo/bar/buzz/zip.psd", true],
        ["c:/foo/Bar/buzz/zip.psd", "c:/foo/bar/buzz/zip.psd", true],
        ["c:/foo/bar/buzz/zip.psdd", "c:/foo/bar/buzz/zip.psd", false],
        ["C:/", "C:/", true],
        ["C:/foo", "c:/foo", true],
        ["C:/foo/", "c:/foo", true]
    ];

    it('isAncestor should work', function()
    {
        IS_ANCESTOR_TESTS.forEach(t => {
            const ancestor = t[0];
            const descendant = t[1];
            const expected = t[2];
            const result = uncSafePath.isAncestor(ancestor, descendant);
            expect(result).to.equal(expected);
        });
    });

});