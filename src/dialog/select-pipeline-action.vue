<template>
    <div>
        <section class="modal-body">
            <p>Select an Action...</p>

            <div class="tree-node">
                <button class="tree-node__expand"><i>&#9654;</i></button>
                <i>&#128447;</i>
                <span>{{name}}</span>
            </div>

        </section>
        <footer class="modal-footer">
            <slot name="footer">
                <button type="button" class="topcoat-button--large" @click="onSelect">
                    Ok
                </button>
                <button type="button" class="topcoat-button--large" @click="onCancel">
                    Cancel
                </button>
            </slot>
        </footer>
    </div>
</template>

<script>
import Server from '../server';

export default {
    name: "SelectPipelineAction",
    data() {
        return {

        }
    },
    created() {
        Server.actions.getAllActionCategories();
        // fetch available action categories (folders/namespaces)
        // fetch action names for selected category
        // when action hovered/clicked display action description
    },
    methods: {
        onCancel() {
            this.$emit('onClose');
        },
        onSelect() {
            this.$emit('onSelect', actionDescriptor);
            this.$emit('onClose');
        }
    }
}
</script>