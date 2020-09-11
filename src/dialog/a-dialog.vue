<template>
    <transition name="modal-fade">
        <div class="modal-backdrop" 
            :class="{open: isOpen}"
            @click="onClose"
            v-show="isOpen">
            <div class="modal" v-bind:style="{ height, width, maxHeight, maxWidth }" @click.stop ref="modal">
                <slot />
            </div>
        </div>
    </transition>
</template>

<script>
export default {
    name: "ADialog",
    props: {
        isOpen: Boolean,
        width: {
            type: String,
            required: true
        },
        height: {
            type: String,
            required: true
        },
        maxWidth: {
            type: String,
            required: false
        },
        maxHeight: {
            type: String,
            required: false
        }
    },
    watch: {
        isOpen(value) {
            if(!value) {
                return;
            }
            this.$nextTick(() => {
                this.setModalBodyHeight();
            })
        }
    },
    methods: {
        onClose() {
            this.$emit('onBackdropClose');
        },
        setModalBodyHeight()
        {
            const headerEl = this.$el.querySelector(".modal-header");
            const bodyEl = this.$el.querySelector(".modal-body");
            const footerEl = this.$el.querySelector(".modal-footer");
            const modalStyle = window.getComputedStyle(this.$refs.modal);
            const modalHeight = parseInt(modalStyle.height, 10);
            const modalPadding = parseInt(modalStyle.paddingTop, 10) + parseInt(modalStyle.paddingBottom, 10);
            const headerHeight = headerEl ? headerEl.clientHeight : 0;
            const footerHeight = footerEl ? footerEl.clientHeight : 0;

            if(bodyEl) {
                bodyEl.style.maxHeight = ((modalHeight - modalPadding) - (headerHeight + footerHeight)) + "px";
            }
        }
    }
}
</script>