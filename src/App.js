import LocalTerminal from "@/components/LocalTerminal.vue";
import {getQuery} from "@/common/util";

export default {
    name: 'App',
    components: {LocalTerminal},
    data() {
        return {
            showLocal: false,
            showSsh: false,
            localInitCmd:null
        }
    },
    created() {
        let query = getQuery()
        if (query.cmd && query.cmd.trim().length > 0) {
            this.localInitCmd = query.cmd
            this.showLocal = true
        }
    },
    mounted() {

    },
    methods: {

    }
}
