<template>
  <div id="Store" class="pa-10">
    <v-app-bar app>
      <v-toolbar-title>المواد</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>

    <v-card class="pa-10">
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
          <v-btn @click="fetchSearch()" color="primary"> بحث </v-btn>
        </v-col>
      </v-row>
      <br />
      <v-data-table items-per-page="500" :items="store" :headers="tableHeader">
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
        <template v-slot:[`item.store`]="{ item }">
          <v-chip
            :color="
              item.totalBuy +
                item.totalRestores +
                item.totalTempBuy -
                (item.totalSell + item.totalBuyRestores) <
              1
                ? 'error'
                : 'success'
            "
            >{{
              item.totalBuy +
              item.totalRestores +
              item.totalTempBuy -
              (item.totalSell + item.totalBuyRestores)
            }}</v-chip
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
    search: {
      from: "",
      to: "",
    },
    tableHeader: [
      { text: "", value: "imagePath" },
      { text: "اسم المادة", value: "fullItemName" },
      { text: "المبيعات", value: "totalSell" },
      { text: "المشتريات", value: "totalBuy" },
      { text: "الراجع", value: "totalRestores" },
      { text: "راجع المشتريات", value: "totalBuyRestores" },
      { text: "شراء مؤقت", value: "totalTempBuy" },
      { text: "المتبقي", value: "store" },
    ],
  }),
  created: function () {
    this.fetch();
  },
  methods: {
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
        .get(this.$baseUrl + `item/detailedStore?from=${this.search.from}&to=${this.search.to}`)
        .then((res) => {
          this.store = res.data;
        })
        .finally(() => loading.hide());
    },
  },
};
</script>

<style>
</style>