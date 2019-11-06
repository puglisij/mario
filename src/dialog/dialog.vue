<template>
  <transition name="modal-fade">
    <div class="modal-backdrop" v-show="isOpen">
      <div class="modal" v-bind:style="{ height: height || options.height, width: width || options.width }">
        <section class="modal-body">
            <slot>
                Are you sure?
            </slot>
        </section>
        <footer class="modal-footer">
          <slot name="footer">
            <button type="button" class="topcoat-button--large" @click="onYes">
                Yes
            </button>
            <button type="button" class="topcoat-button--large" @click="onCancel">
                Cancel
            </button>
          </slot>
        </footer>
      </div>
    </div>
  </transition>
</template>

<script>
import {events} from './events';

const defaultOptions = {
    height: "auto",
    width: "80%"
};

export default {
    name: 'a-dialog',
    data: () => ({
        isOpen: false,
        options: defaultOptions
    }),
    props: {
        name: {
            type: String,
            required: true
        },
        height: {
            type: String
        },
        width: {
            type: String
        }
    },
    mounted () {
        events.$on('open', this.open);
        events.$on('close', this.close);
    },
    methods: {
        open(options) {
            console.log("dialog open");
            if (this.name !== options.name) {
                return;
            }
            this.options = Object.assign({}, defaultOptions, options);
            this.isOpen = true;
        },
        close(name) {
            console.log("dialog closed");
            if (this.name !== name) {
                return;
            }
            this.isOpen = false;
            this.options = defaultOptions
        },
        onYes() {
            this.options.onYes && this.options.onYes();
            this.close(this.name);
        },
        onCancel() {
            this.options.onCancel && this.options.onCancel();
            this.close(this.name);
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