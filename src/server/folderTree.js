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
    isLeaf() {
        return !this.hasChildren();
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
    /**
     * @returns {string[]} an array of node names indicating the path to this node from the root
     */
    getNamePath() {
        let node = this;
        let names = [node.name];
        while(node && (node = node.parent)) {
            names.push(node.name);
        }
        return names.reverse();
    }
    insert(namePath, isDirectory)
    {
        let node = this;
        let nodeName = (this.name === namePath[0]) ? namePath.shift() : "";
        while(nodeName = namePath.shift())
        {
            const isEndOfPath = namePath.length === 0;
            const childIsDirectory = isEndOfPath && !isDirectory ? false : true;
            let child = node.getChildByName(nodeName);
            if(!child) {
                child = new FolderTreeNode(nodeName, childIsDirectory);
                node.addChild(child);
            } 
            node = child;
        }
    }
    /**
     * Returns the node given at the end of the name path by traversing the tree
     * @param {string[]} namePath 
     * @returns {FolderTreeNode} or null
     */
    traverse(namePath)
    {
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
    arrayify(node)
    {
        // pre order traversal
        if(node.hasChildren()) {
            const result = node.children.map(c => node.arrayify(c));
            return [node.name, result];
        } else {
            return node.name;
        }
    }
    /**
     * Clones this Folder tree node
     */
    clone()
    {
        return new FolderTreeNode(this.name, this.isDirectory);
    }
    /**
     * Clones the Folder tree using this node as the root node
     */
    cloneTree()
    {
        let newRoot = this.clone();
        let newStack = [newRoot];
        let oldStack = [this];
        let newNode, oldNode;
        while((oldNode = oldStack.pop()) && (newNode = newStack.pop()))
        {
            for(let i = 0; i < oldNode.children.length; ++i)
            {
                let oldChild = oldNode.children[i];
                let newChild = oldChild.clone();
                newNode.addChild(newChild);
                newStack.push(newChild);
                oldStack.push(oldChild);
            }
        }
        return newRoot;
    }
    parse(model)
    {

    }
}
