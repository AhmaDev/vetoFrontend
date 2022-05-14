<template>
  <div id="DamagedItems" class="pa-10">
    <v-app-bar app>
      <v-toolbar-title>المواد التالفة</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn
        :disabled="!checkPermission('damaged_add')"
        icon
        to="/new/damagedItems"
      >
        <v-icon>mdi-plus</v-icon>
      </v-btn>
    </v-app-bar>

    <v-card>
      <v-data-table
        :items-per-page="1000"
        :headers="invoices.header"
        :items="invoices.data"
      >
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn icon :to="'/damagedItems/' + item.idDamagedItemsInvoice">
            <v-icon :title="item.idInvoice">mdi-magnify</v-icon>
          </v-btn>
          <v-menu v-if="checkPermission('damaged_delete')" offset-y>
            <template v-bind="item" v-slot:activator="{ on, attrs }">
              <v-btn v-bind="attrs" v-on="on" icon>
                <v-icon color="red" title="حذف الفاتورة"
                  >mdi-delete-outline</v-icon
                >
              </v-btn>
            </template>
            <v-list>
              <v-list-item @click="deleteInvoice(item.idInvoice)">
                <v-list-item-title
                  >اضغط هنا لتأكيد حذف الفاتورة</v-list-item-title
                >
              </v-list-item>
            </v-list>
          </v-menu>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "DamagedItems",
  data: () => ({
    permissions: [],
    invoices: {
      header: [
        { text: "اسم الزبون", value: "customerName" },
        { text: "الجهة", value: "createdByName" },
        { text: "بتاريخ", value: "creationFixedDate" },
        { text: "الوقت", value: "creationFixedTime" },
        { text: "الاجراءات", value: "actions" },
      ],
      data: [],
    },
  }),
  created: function () {
    this.fetch();
  },
  methods: {
    checkPermission(permissionKey) {
      var isAuthorized = this.permissions.filter(
        (p) => p.permissionKey == permissionKey
      );
      if (isAuthorized.length > 0) return true;
      else return false;
    },
    fetch() {
      // LOAD PERMS START
      this.auth().then((res) => {
        this.permissions = res.permissions;
        // CHECK IF CAN SEE THIS PAGE
        if (!this.checkPermission("damaged")) {
          this.$toast.open({
            type: "error",
            message: "غير مصرح لك بمشاهدة هذه الصفحة",
            duration: 3000,
          });
          this.$router.go(-1);
        }
      });
      // LOAD PERMS END
      let loading = this.$loading.show();
      this.$http
        .get(this.$baseUrl + "damagedInvoice")
        .then((res) => {
          this.invoices.data = res.data;
        })
        .finally(() => loading.hide());
    },
  },
};
</script>

<style>
</style>