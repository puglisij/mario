<template>
    <form id="pipelines-form"
        @submit="onConfigurationSubmit"
        novalidate="true"
    >
        <h2>Pipelines</h2>
        <div class="pipeline"
            v-for="pipeline in configuration.pipelines"
            :key="pipeline.id"
        >
            <checkbox v-model="pipeline.doImagesRequireMetadataFile" @change="onPipeline">
                Require meta data file
            </checkbox>
            <input class="topcoat-text-input" type="text" placeholder="my-pipeline-name"
                v-model="pipeline.name"
                @change="onPipeline"
            />
            <input class="topcoat-text-input" type="text" placeholder="my-type-1, my-type-2"
                v-model="pipeline.for"
                @change="onPipeline"
            />
        </div>
    </form>
</template>

<script>
import checkbox from "./checkbox.vue";
import _ from "../utils";

export default {
    name: "configurator",
    components: {
        checkbox
    },
    props: {
        configuration: Object
    }, 
    data: () => ({
        needSaved: false
    }),
    methods: {
        onPipeline(event)
        {
            this.needSaved = true;

        },
        onAddNewPipeline(event)
        {
            const guid = _.guid();
            
        },
        onDeletePipeline(event)
        {

        },
        onConfigurationSubmit(event) 
        {
            event.preventDefault();
            this.$emit('update:pipelines', this.configuration.pipelines);
            this.needSaved = false;
        }
    }
}
</script>

<style scoped>

</style>