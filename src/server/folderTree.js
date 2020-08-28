export default class FolderTreeNode
{
    constructor(name = "", isDirectory = false) {
        // FolderTree
        this.parent = null;
        // boolean
        this.isDirectory = isDirectory;
        // string
        this.name = name || "";
        // Array<FolderTree>
        this.children = [];
    }
    isRoot() { 
        return this.parent === null;
    }
    hasChildren() {
        return this.children.length > 0;
    }
    addChild(node)
    {
        node.parent = this;
        this.children.push(node);
    }
    removeChild(node)
    {
        this.children = this.children.filter(c => c !== node);
    }
    getChildByName(name) {
        return this.children.find(c => c.name === name);
    }
    getNamePath() {
        let node = this;
        let names = [node.name];
        while(!node.isRoot()) {
            names.push(node.name);
            node = node.parent;
        }
        return names;
    }
    /**
     * Returns the node given at the end of the name path by traversing the tree
     * @param {string[]} namePath 
     * @returns {FolderTreeNode} or null
     */
    traverse(namePath)
    {
        if(namePath.length === 1 && namePath[0] === this.name) {
            return this;
        }
        let node = this;
        let nodeName = (this.name === namePath[0]) ? namePath.shift() : "";
        while(node && (nodeName = namePath.shift())) {
            node = node.getChildByName(nodeName);
        }
        return node;
    }
    drop()
    {
        this.parent.removeChild(this);
        this.parent = null;
    }
    parse(model)
    {

    }
}
