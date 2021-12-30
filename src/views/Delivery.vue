<template>
  <div ref="print" id="deliveyPage" class="pa-10">
    <v-app-bar app>
      <v-toolbar-title>كشف التوزيع</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>
    <v-card class="pa-10">
      <v-row>
        <v-col>
          <v-autocomplete
            :items="deliveries"
            item-text="username"
            item-value="idUser"
            outlined
            hide-details
            dense
            label="الموزعين"
            multiple
            v-model="selectedDeliveries"
          ></v-autocomplete>
        </v-col>
        <v-col>
          <v-text-field
            v-model="selectedDate"
            label="التاريخ"
            type="date"
            outlined
            hide-details
            dense
          ></v-text-field>
        </v-col>
        <v-col>
          <v-btn @click="startMethod()" dark :color="$background">
            اضافة كشف توزيع جديد
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
    <br />
    <v-card class="pa-10">
      <v-data-table :items="deliveriesStatus" :headers="tableHeader">
        <template v-slot:[`item.total`]="{ item }">
          {{ sum(item) }}
        </template>
        <template v-slot:[`item.actions`]="{ item }">
          <v-btn
            color="primary"
            elevation="0"
            small
            :to="'/delivery/' + item.idDeliveryStatus"
          >
            مشاهدة كشف التوزيع
          </v-btn>
          &nbsp;
          <v-btn
            color="error"
            elevation="0"
            small
            :to="'/money/' + item.idDeliveryStatus"
          >
            مشاهدة كشف المالية
          </v-btn>
          &nbsp;

          <v-btn
            color="success"
            elevation="0"
            small
            :to="'/print/invoice/' + item.idInvoice"
          >
            طباعة كشف التوزيع
          </v-btn>
          &nbsp;

          <v-btn
            color="warning"
            elevation="0"
            small
            :to="'/print/invoice/' + item.idInvoice"
          >
            طباعة كشف المالية
          </v-btn>
          &nbsp;

          <v-btn
            color="secondary"
            elevation="0"
            small
            :to="'/print/invoice/' + item.idInvoice"
          >
            طباعة الفواتير
          </v-btn>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "Delivery",
  data: () => ({
    deliveriesStatus: [],
    deliveries: [],
    selectedDeliveries: [],
    selectedDate: null,
    tableHeader: [
      { text: "رقم التوزيع", value: "idDeliveryStatus" },
      { text: "اسم الموزع", value: "deliveryName" },
      { text: "التاريخ", value: "creationFixedDate" },
      { text: "المبلغ", value: "total" },
      { text: "الاجراءات", value: "actions" },
    ],
  }),
  created: function () {
    this.fetch();
    this.getData();
  },
  methods: {
    fetch() {
      this.$http.get(this.$baseUrl + "users/role/5").then((res) => {
        this.deliveries = res.data;
      });
    },
    getData() {
      let loading = this.$loading.show();
      this.$http
        .get(this.$baseUrl + "deliveryStatus")
        .then((res) => {
          this.deliveriesStatus = res.data;
        })
        .finally(() => loading.hide());
    },
    startMethod() {
      if (this.selectedDeliveries.length == 0 || this.selectedDate == null) {
        this.$toast.open({
          type: "error",
          message: "يرجى اختيار الموزعين وتاريخ التوزيع",
          duration: 3000,
        });
        return;
      }
      let loading = this.$loading.show();
      this.$http
        .post(this.$baseUrl + "deliveryStatus/multipleInsert", {
          deliveries: this.selectedDeliveries,
          date: this.selectedDate,
        })
        .then(() => {
          setTimeout(() => {
            this.getData();
            loading.hide();
          }, 5000);
        });
    },
    sum(item) {
      let total = 0;
      for (let i = 0; i < item.invoicesData.length; i++) {
        total = total + item.invoicesData[i].total;
      }
      return total.toLocaleString();
    },
  },
};
</script>

<style>

</style>