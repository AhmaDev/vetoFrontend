<template>
    <div id="clients" class="pa-10">
        <v-app-bar app>
            <v-toolbar-title>المستخدمين</v-toolbar-title>
            <v-spacer></v-spacer>
        </v-app-bar>

        <v-data-table sort-by="status" sort-desc :items="users" :headers="headers" :items-per-page="-1">
            <template v-slot:[`item.status`]="{ item }">
                <v-chip color="success" v-if="item.status == 1">متصل</v-chip>
                <v-chip color="error" v-if="item.status == 0">غير متصل</v-chip>
            </template>
        </v-data-table>
    </div>
</template>

<script>
export default {
    data: () => ({
        users: [],
        headers: [
            { text: "اسم الحساب", value: "username" },
            { text: "الحالة", value: "status" },
        ]
    }),
    created: function () {
        this.fetch();
    },
    methods: {
        fetch() {
            this.$http.get(this.$baseUrl + 'users').then(res => {
                this.$http.get(this.$baseUrl + 'clients').then(resClients => {
                    this.users = res.data;
                    for (let i = 0; i < this.users.length; i++) {
                        const user = this.users[i];
                        if (resClients.data.filter(e => e.idUser == user.idUser).length > 0) {
                            this.users[i].status = 1;
                        } else {
                            this.users[i].status = 0;
                        }
                    }
                })
            })
        },
    }
}
</script>

<style></style>