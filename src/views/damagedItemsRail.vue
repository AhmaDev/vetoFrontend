<template>
  <div class="pa-10" id="damagedItemsRail">
    <v-app-bar app>
      <v-toolbar-title>المواد التالفة</v-toolbar-title>
    </v-app-bar>
    <v-card class="pa-10">
      <v-row>
        <v-col>
          <v-autocomplete
            outlined
            label="المادة"
            v-model="search.itemId"
            :items="items"
            item-value="idItem"
            item-text="fullItemName"
            dense
            hide-details=""
          ></v-autocomplete>
        </v-col>
        <v-col>
          <v-text-field
            type="date"
            v-model="search.from"
            outlined
            label="من تاريخ"
            dense
            hide-details
          ></v-text-field>
        </v-col>
        <v-col>
          <v-text-field
            type="date"
            v-model="search.to"
            outlined
            label="الى تاريخ"
            dense
            hide-details
          ></v-text-field>
        </v-col>
        <v-col cols="1">
          <v-btn @click="fetch()" color="primary">بحث</v-btn>
        </v-col>
      </v-row>
      <v-simple-table>
        <thead>
          <tr>
            <th>رقم الفاتورة</th>
            <th>الزبون</th>
            <th>المندوب</th>
            <th>الكمية بالكارتون</th>
            <th>الكمية بالقطع</th>
            <th>الاجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="invoice in invoices" :key="invoice.damagedItemsInvoiceId">
            <td>
              {{ invoice.damagedItemsInvoiceId }}
            </td>
            <td>{{ invoice.customerName }} ({{ invoice.customerId }})</td>
            <td>{{ invoice.createdByName }}</td>
            <td>
              {{
                (
                  invoice.count /
                  items.filter((e) => e.idItem == search.itemId)[0]
                    .cartonQauntity
                ).toFixed(2)
              }}
            </td>
            <td>
              {{ invoice.count }}
            </td>
            <td>
              <v-btn
                :to="'/damagedItems/' + invoice.damagedItemsInvoiceId"
                target="_blank"
                small
                color="primary"
              >
                <span>مشاهدة</span>
              </v-btn>
            </td>
          </tr>
        </tbody>
      </v-simple-table>
    </v-card>
  </div>
</template>

<script>
export default {
  data: () => ({
    invoices: [],
    isLoading: false,
    search: {
      itemId: 0,
      from: "",
      to: "",
    },
    items: [],
  }),
  created: function () {
    this.getCurrentDate().then((value) => {
      this.search.from = value;
      this.search.to = value;
    });
    this.$http.get(this.$baseUrl + "item").then((res) => {
      this.items = res.data;
      setTimeout(() => {
        if (this.$route.query.itemId) {
          this.search.itemId = parseInt(this.$route.query.itemId);
          this.search.from = this.$route.query.from;
          this.search.to = this.$route.query.to;
          this.fetch();
        }
      }, 500);
    });
  },
  methods: {
    fetch() {
      let loading = this.$loading.show();
      this.$http
        .get(
          this.$baseUrl +
            `damagedInvoice/contents?item=${this.search.itemId}&dateRangeFrom=${this.search.from}&dateRangeTo=${this.search.to}`
        )
        .then((res) => {
          this.invoices = res.data;
        })
        .finally(() => loading.hide());
    },
  },
};
</script>

<style>
</style>