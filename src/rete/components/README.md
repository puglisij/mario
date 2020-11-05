# Components

The components are designed to simplify development by combining the closely related functions of building and processing nodes.

They are not Nodes themselves.
Components Do Not store a reference to the node. The only reference is passed to builder()

The node is created by the Component in an internal createNode() call. 
At this point, the data object from Component is assigned to the node.

The same data from the JSON is stored by 'key' in the component's 'data' property.

```
code here
```

