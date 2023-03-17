import TerminalPage from "@/components/TerminalPage.vue";
import {getQuery} from "@/common/util";

export default {
    name: 'App',
    components: {TerminalPage},
    data() {
        return {
            editMode: false,
            localInitCmd:null
        }
    },
    created() {
        let query = getQuery()
        if (query.cmd && query.cmd.trim().length > 0) {
            this.localInitCmd = query.cmd
            this.editMode = true
        }
    },
    mounted() {

    },
    methods: {

    }
}
