<template>
  <div ref="print" id="deliveyPage" class="pa-10">
    <v-app-bar app>
      <v-toolbar-title>كشف التوزيع</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>
    <v-card class="pa-10 deliveryStatusTable">
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
        <v-col cols="2">
          <v-btn @click="startMethod(0)" dark :color="$background">
            اضافة كشف توزيع جديد
          </v-btn>
        </v-col>
        <v-col cols="2">
          <v-btn @click="startMethod(1)" dark :color="$background">
            اضافة كشف مالية جديد
          </v-btn>
        </v-col>
      </v-row>
    </v-card>
    <br />
    <v-row>
      <v-col cols="12" md="6">

        <v-card class="pa-10 deliveryStatusTable">
        <h3>كشف التوزيع</h3>
          <v-data-table :items="deliveriesStatus" :headers="tableHeader">
            <template v-slot:[`item.total`]="{ item }">
              {{ sum(item) }}
            </template>
            <template v-slot:[`item.actions`]="{ item }">
              <v-btn
                color="primary"
                elevation="0"
                block
                small
                :to="'/delivery/' + item.idDeliveryStatus"
              >
                مشاهدة كشف التوزيع
              </v-btn>
              <v-btn
                color="success"
                elevation="0"
                block
                small
                :to="'/delivery/' + item.idDeliveryStatus + '?print=true'"
              >
                طباعة كشف التوزيع
              </v-btn>
              <v-btn
                color="secondary"
                block
                elevation="0"
                small
                :to="
                  '/print/invoice/' + JSON.stringify(item.invoices).slice(1, -1)
                "
              >
                طباعة الفواتير
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
      <v-col cols="12" md="6">
        <v-card class="pa-10 deliveryStatusTable">
        <h3>كشف المالية</h3>
          <v-data-table :items="deliveriesStatusMoney" :headers="tableHeaderMoney">
            <template v-slot:[`item.total`]="{ item }">
              {{ sum(item) }}
            </template>
            <template v-slot:[`item.actions`]="{ item }">
              <v-btn
                color="error"
                elevation="0"
                small
                block
                :to="'/money/' + item.idDeliveryStatus"
              >
                مشاهدة كشف المالية
              </v-btn>
              <v-btn
                color="warning"
                elevation="0"
                small
                block
                :to="'/money/' + item.idDeliveryStatus + '?print=true'"
              >
                طباعة كشف المالية
              </v-btn>
              <v-btn
                color="secondary"
                elevation="0"
                small
                block
                :to="
                  '/print/invoice/' + JSON.stringify(item.invoices).slice(1, -1)
                "
              >
                طباعة الفواتير
              </v-btn>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
export default {
  name: "Delivery",
  data: () => ({
    deliveriesStatus: [],
    deliveries: [],
    selectedDeliveries: [],
    deliveriesStatusMoney: [],
    selectedDate: null,
    tableHeader: [
      { text: "رقم التوزيع", value: "idDeliveryStatus" },
      { text: "اسم الموزع", value: "deliveryName" },
      { text: "التاريخ", value: "creationFixedDate" },
      { text: "المبلغ", value: "total" },
      { text: "الاجراءات", value: "actions" },
    ],
    tableHeaderMoney: [
      { text: "رقم الكشف", value: "idDeliveryStatus" },
      { text: "التاريخ", value: "creationFixedDate" },
      { text: "المبلغ", value: "total" },
      { text: "الاجراءات", value: "actions" },
    ],
  }),
  created: function () {
    this.getCurrentDate().then((value) => {
      this.selectedDate = value;
    });
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
          this.deliveriesStatus = res.data.filter(e => e.deliveryStatusType == 0);
          this.deliveriesStatusMoney = res.data.filter(e => e.deliveryStatusType == 1);
        })
        .finally(() => loading.hide());
    },
    startMethod(type) {
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
          deliveryStatusType: type,
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
.deliveryStatusTable .v-btn {
  margin: 5px !important;
}
</style>