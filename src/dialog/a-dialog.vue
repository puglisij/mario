<template>
    <transition name="modal-fade">
        <div class="modal-backdrop" 
            :class="{open: isOpen}"
            v-show="isOpen">
            <div class="modal" v-bind:style="{ height: height, width: width }" @click.stop>
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
        }
    }
}
</script>