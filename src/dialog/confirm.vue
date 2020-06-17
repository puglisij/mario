<template>
    <div>
        <section class="modal-body">
            {{ message }}
        </section>
        <footer class="modal-footer">
            <slot name="footer">
                <button type="button" class="topcoat-button--large" @click="$emit('onClose', true)">
                    Yes
                </button>
                <button type="button" class="topcoat-button--large" @click="$emit('onClose', false)">
                    Cancel
                </button>
            </slot>
        </footer>
    </div>
</template>

<script>
export default {
    name: "Confirm",
    props: {
        message: {
            type: String, 
            required: true
        }
    }
}
</script>