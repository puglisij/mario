<template>
    <div>
        <section class="modal-body">
            <p>Select an Action...</p>
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


export default {
    name: "SelectPipelineAction",
    data() {
        return {

        }
    },
    created() {
        
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