<template>
    <div :style="indent">
        <div class="tree-node"
            :class="{expanded: isExpanded, directory: node.isDirectory}"
            @click="select"
        >
            <button 
                class="tree-node__expand topcoat-icon-button--quiet"
                type="button"
                v-if="node.isDirectory"
            >
                <i>&#9654;</i>
            </button>
            <i v-if="node.isDirectory">&#128447;</i>
            <span>{{name}}</span> 
        </div>

        <select-pipeline-action-node 
            v-for="(node, index) in children"
            :key="getName(children[index])"
            :node="children[index]"
            :depth="1"
            @on-select="$emit('on-select', $event)"
        />
    </div>
</template>

<script>
import FolderTreeNode from "../folderTree";

export default {
    name: "SelectPipelineActionNode",
    props: {
        node: {
            type: Object,
            required: true,
            validator: function(value) {
                return value instanceof FolderTreeNode;
            }
        },
        depth: {
            type: Number,
            default: 0
        },
        expand: {
            type: Boolean,
            default: false
        }
    },
    data() {
        return {
            isExpanded: this.expand,
            name: this.getName(this.node)
        }
    },
    computed: {
        children() {
            return this.isExpanded ? this.node.children : [];
        },
        indent() {
            return { transform: `translateX(${this.depth * 44}px)` }
        }
    },
    methods: {
        getName(node) {
            return node.getNamePath().join(".");
        },
        select() {
            if(this.node.isDirectory) {
                this.isExpanded = !this.isExpanded;
            } else {
                this.$emit("on-select", this.name);
            }
        }
    }
}
</script>