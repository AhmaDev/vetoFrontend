<template>
  <div id="Store" class="pa-10">
    <v-app-bar app>
      <v-toolbar-title>المواد</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn @click="$print($refs.print)" color="success" dark>
        <v-icon>la-print</v-icon>
        طباعة
      </v-btn>
    </v-app-bar>

    <v-card ref="print" class="pa-10">
      <center class="printHeader"><h2>اعداد المخزن</h2></center>

      <v-row>
        <v-col>
          <v-text-field
            outlined
            dense
            hide-details
            label="من تاريخ"
            v-model="search.from"
            type="date"
          ></v-text-field>
        </v-col>
        <v-col>
          <v-text-field
            outlined
            dense
            hide-details
            label="الى تاريخ"
            v-model="search.to"
            type="date"
          ></v-text-field>
        </v-col>
        <v-col>
          <v-btn @click="fetchSearch();" color="primary"> بحث </v-btn>
        </v-col>

      </v-row>
      <br />
      <v-data-table v-if="lastStore.length > 0" :items-per-page="500" :items="store" :headers="tableHeader">
        <template v-slot:[`item.imagePath`]="{ item }">
          <v-avatar size="36">
            <img
              v-if="item.imagePath != null"
              :src="$baseUrl + 'files/' + item.imagePath"
            />
            <img
              v-if="item.imagePath == null"
              src="@/assets/no_image_placeholder.png"
            />
          </v-avatar>
        </template>
        <template v-slot:[`item.lastRemaining`]="{ item }">
          {{
            lastStore.filter((s) => s.idItem == item.idItem)[0].totalBuy +
            lastStore.filter((s) => s.idItem == item.idItem)[0].totalRestores +
            lastStore.filter((s) => s.idItem == item.idItem)[0].totalTempBuy -
            (lastStore.filter((s) => s.idItem == item.idItem)[0].totalSell +
              lastStore.filter((s) => s.idItem == item.idItem)[0]
                .totalBuyRestores)
          }}
        </template>
        <template v-slot:[`item.storex`]="{ item }">
          <v-chip
            :color="
              item.storex <
              0.25
                ? 'error'
                : 'success'
            "
          >
            {{ item.storex }}</v-chip
          >
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "Store",
  data: () => ({
    store: [],
    lastStore: [],
    search: {
      from: "",
      to: "",
    },
    tableHeader: [
      { text: "", value: "imagePath" },
      { text: "اسم المادة", value: "fullItemName" },
      { text: "المورد", value: "manufactureName" },
      { text: "المجموعة", value: "itemGroupName" },
      { text: "رصيد اول المدة", value: "lastRemaining" },
      { text: "المبيعات", value: "totalSell" },
      { text: "المشتريات", value: "totalBuy" },
      { text: "الراجع", value: "totalRestores" },
      { text: "راجع المشتريات", value: "totalBuyRestores" },
      { text: "شراء مؤقت", value: "totalTempBuy" },
      { text: "المتبقي", value: "storex" },
    ],
  }),
  created: function () {
    // LOAD PERMS START
    this.auth().then((res) => {
      this.permissions = res.permissions;
      // CHECK IF CAN SEE THIS PAGE
      if (!this.checkPermission("store")) {
        this.$toast.open({
          type: "error",
          message: "غير مصرح لك بمشاهدة هذه الصفحة",
          duration: 3000,
        });
        this.$router.go(-1);
      }
    });
    // LOAD PERMS END
    // this.fetch();
    this.getCurrentDate().then((value) => {
      this.search.from = value;
      this.search.to = value;
    });
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
      let loading = this.$loading.show();
      this.$http
        .get(this.$baseUrl + "item/detailedStore")
        .then((res) => {
          this.store = res.data;
        })
        .finally(() => loading.hide());
    },
    fetchSearch() {
      let loading = this.$loading.show();
      this.$http
        .get(
          this.$baseUrl +
            `item/detailedStore?from=${this.search.from}&to=${this.search.to}`
        )
        .then((res) => {
          this.store = res.data;
        })
        .finally(() => loading.hide());
      this.$http
        .get(
          this.$baseUrl +
            `item/detailedStore?from=2020-01-01&to=${this.search.from}`
        )
        .then((res) => {
          this.lastStore = res.data;
          setTimeout(() => {
            this.store = this.store.map(row => (row.storex = this.getTotal(row), row));

          }, 1000);
        })
        .finally(() => loading.hide());
    },
    getTotal(item) {
      return (
        this.lastStore.filter((s) => s.idItem == item.idItem)[0].totalBuy +
        this.lastStore.filter((s) => s.idItem == item.idItem)[0].totalRestores +
        this.lastStore.filter((s) => s.idItem == item.idItem)[0].totalTempBuy -
        (this.lastStore.filter((s) => s.idItem == item.idItem)[0].totalSell +
          this.lastStore.filter((s) => s.idItem == item.idItem)[0]
            .totalBuyRestores) -
        item.totalSell -
        item.totalBuyRestores +
        item.totalBuy +
        item.totalRestores +
        item.totalTempBuy
      );
    },
    sort() {
      this.store = this.store.sort((a,b) => a.totalSell.localeCompare(b.totalSell))
    }
  },
};
</script>

<style scoped>
.printHeader {
  display: none !important;
}
@media print {
  .printHeader {
    display: block !important;
    padding: 10px;
  }
  @page {
    size: A4 landscape;
  }
  * {
    direction: rtl !important;
    color-adjust: exact !important;
    zoom: 0.9;
  }
  .v-btn {
    display: none !important;
  }
  .v-card {
    box-shadow: none !important;
  }
}
</style>