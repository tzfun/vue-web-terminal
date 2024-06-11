import CodeEditor from "@/components/CodeEditor.vue";
import Running from "@/components/Running.vue";

export default {
    name: "Runtime",
    components: {CodeEditor, Running},
    data() {
        return {
            code: ""
        }
    },
    methods: {
        running () {
            this.$refs.run.reset()
            this.$refs.run.buildDom(this.code)
        }
    }
}