export class FolderTreeNode
{
    constructor() {
        // FolderTree
        this.parent = null;
        // boolean
        this.isDirectory = false;
        // string
        this.name = "";
        // Array<FolderTree>
        this.children = [];
    }
    isRoot() { 
        return this.parent === null;
    }
    hasChildren() {
        return this.children.length > 0;
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
    traverse(namePath)
    {
        let node = this;
        let nodeName = (this.name === namePath[0]) ? namePath.shift() : "";
        while(node && (nodeName = namePath.shift())) {
            node = node.getChildByName(nodeName);
        }
        return node;
    }
}
