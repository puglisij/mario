<template>
    <a-dialog :isOpen="isOpen" :width="width" :height="height">
        <component :is="component" v-bind="props" v-on="listeners" @onClose="close" />
    </a-dialog>
</template>

<script>
import {events} from './events';
import ADialog from './a-dialog.vue';
import Confirm from './builtins/confirm.vue';

const defaultOptions = {
    height: "auto",
    width: "80%"
};

export default {
    name: 'ADialogRoot',
    components: {
        ADialog
    },
    data: () => ({
        component: null,
        width: "",
        height: "",
        props: null,
        listeners: null
    }),
    computed: {
        isOpen() {
            return !!this.component;
        }
    },
    mounted () {
        events.$on('openconfirm', this.openConfirm);
        events.$on('open', this.open);
        events.$on('close', this.close);
    },
    methods: {
        openConfirm({ onYes, onCancel, message, ...args }) 
        {
            this.open({ 
                component: Confirm, 
                listeners: {
                    onClose: (isYes) => {
                        if(isYes)
                            onYes && onYes();
                        else 
                            onCancel && onCancel();
                    }
                },
                props: {
                    message
                },
                ...args
            });
        },
        open({ width, height, component, props = null, listeners = null }) 
        {
            if(this.isOpen) {
                console.warn("Dialog already open. Ignoring open: " + component.name);
                return;
            }
            console.log(`Dialog open.`);

            this.width = width || defaultOptions.width;
            this.height = height || defaultOptions.height;
            this.component = component;
            this.props = props;
            this.listeners = listeners;
        },
        /**
         * IMPORTANT: Should only be called by child component 'onClose' event.
         * Otherwise previous open() calls could be left hanging (e.g. waiting for a callback)
         */
        close() {
            console.log(`Dialog close.`);

            this.component = null;
            this.props = null;
            this.listeners = null;
        }
    }
}
</script>

<style>
  .modal-backdrop {
    position: fixed;
    top: 0;
    bottom: 0;
    left: 0;
    right: 0;
    background-color: rgba(0, 0, 0, 0.4);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 1;
  }

  .modal {
    background: #444;
    overflow-x: auto;
    display: flex;
    flex-direction: column;
  }

  .modal-body {
    position: relative;
    padding: 20px 10px;
  }

  .modal-footer {
    border-top: 1px solid #eeeeee;
    display: flex;
    justify-content: flex-start;
    padding: 15px;
  }
</style>