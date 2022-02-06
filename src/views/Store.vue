<template>
  <div id="Store" class="pa-10">
    <v-app-bar app>
      <v-toolbar-title>المواد</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>

    <v-card class="pa-10">
      <v-data-table items-per-page="500" :items="store" :headers="tableHeader">
        <template v-slot:[`item.imagePath`]="{ item }">
          <v-avatar size="36">
              <img v-if="item.imagePath != null" :src="$baseUrl + 'files/' + item.imagePath">
              <img v-if="item.imagePath == null" src="@/assets/no_image_placeholder.png">
          </v-avatar>
        </template>
        <template v-slot:[`item.store`]="{ item }">
          <v-chip :color="item.store < 1 ? 'error': 'success'">{{item.store}}</v-chip>
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
    tableHeader: [
      { text: "", value: "imagePath" },
      { text: "اسم المادة", value: "fullItemName" },
      { text: "الادخال", value: "totalPlus" },
      { text: "الاخراج", value: "totalMinus" },
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
        .get(this.$baseUrl + "item/store")
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