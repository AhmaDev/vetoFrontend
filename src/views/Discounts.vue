<template>
  <div id="discountsPage" class="pa-10">
    <v-app-bar app>
      <v-toolbar-title>كشف بهدايا المندوبين</v-toolbar-title>
    </v-app-bar>
    <v-card class="pa-10">
      <v-row>
        <v-col>
          <v-autocomplete
            :items="users"
            item-text="username"
            item-value="idUser"
            outlined
            label="المندوب"
            dense
            hide-details
            v-model="search.userId"
          ></v-autocomplete>
        </v-col>
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
      <v-data-table
        items-per-page="1000"
        :items="discounts"
        :headers="discountsHeader"
      >
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
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn icon target="_BLANK" :to="'/invoice/' + item.invoiceId">
            <v-icon :title="item.invoiceId">mdi-magnify</v-icon>
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
export default {
  data: () => ({
    users: [],
    search: {
      from: "",
      to: "",
      userId: 0,
    },
    discounts: [],
    discountsHeader: [
      { text: "", value: "imagePath" },
      { text: "اسم المادة", value: "fullItemName" },
      { text: "الكمية", value: "count" },
      { text: "نوع الخصم", value: "discountName" },
      { text: "بتاريخ", value: "creationFixedDate" },
      { text: "الوقت", value: "creationFixedTime" },
      { text: "الاجراءات", value: "actions" },
    ],
  }),
  created: function () {
    this.getCurrentDate().then((value) => {
      this.search.from = value;
      this.search.to = value;
    });
    let loading = this.$loading.show();
    this.$http
      .get(this.$baseUrl + "users/role/4")
      .then((res) => {
        this.users = res.data;
      })
      .finally(() => loading.hide());
  },
  methods: {
    fetchSearch() {
      let loading = this.$loading.show();
      this.$http
        .get(
          this.$baseUrl +
            "discount/users/" +
            this.search.userId +
            "?from=" +
            this.search.from +
            "&to=" +
            this.search.to
        )
        .then((res) => {
          this.discounts = res.data;
        })
        .finally(() => loading.hide());
    },
  },
};
</script>

<style>
</style>