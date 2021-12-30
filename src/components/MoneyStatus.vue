<template>
  <div ref="print" v-if="deliveryStatus != null" id="deliveryStatus" class="pa-10">
    <v-sheet class="pa-10 sheet" elevation="2">
      <div v-if="appData != null" class="pa-10">
        <center>
          <h2>
            كشف المالية
            {{ appData.filter((e) => e.variable == "title")[0].value }}
          </h2>
        </center>
      </div>
      <table border="1" cellspacing="0" width="100%" class="table" dir="rtl">
        <tr>
          <td>رقم التوزيع: {{ deliveryStatus.idDeliveryStatus }}</td>
          <td>اسم الموزع: {{ deliveryStatus.deliveryName }}</td>
          <td>
            تاريخ التجهيز: {{ deliveryDate(deliveryStatus.creationFixedDate) }}
          </td>
          <td>تاريخ طبع الكشف: {{ currentDay() }}</td>
          <td>
            تاريخ الفواتير: {{ fixedDate(deliveryStatus.creationFixedDate) }}
          </td>
          <td>طابع الكشف:</td>
        </tr>
      </table>
      <table class="table" border="1" cellspacing="0" width="100%" dir="rtl">
        <thead>
          <th>اسم المادة</th>
          <th>عدد النقص</th>
          <th>مبلغ النقص</th>
          <th>العدد</th>
          <th>السعر</th>
          <th>الاجمالي</th>
          <th>عدد الراجع</th>
          <th>مبلغ الراجع</th>
          <th>الصافي</th>
        </thead>
        <template v-for="(item, i) in deliveryStatus.invoicesData">
          <tr
            :style="
              item.total == 0 ? 'background-color: red; color: white' : ''
            "
            :key="i"
          >
            <td>{{ item.itemName }}</td>
            <td></td>
            <td></td>
            <td>{{ item.count }}</td>
            <td v-if="item.discountTypeId > 0">
              {{ getDiscountName(item.discountTypeId) }}
            </td>
            <td v-else>
              {{ item.total / item.count }}
            </td>
            <td>{{ item.total.toLocaleString() }}</td>
            <td></td>
            <td></td>
            <td></td>
          </tr>
        </template>
      </table>
    </v-sheet>
    <br />
    <v-sheet class="pa-10 sheet" elevation="2">
      <table class="table" border="1" cellspacing="0" width="100%" dir="rtl">
    <tr>
        <td colspan="2">اسم الحساب</td>
        <td>البيان</td>
    </tr>
    <tr>
        <td width="200px">مجموع الاعداد مباعة بالمبالغ</td>
        <td width="200px">{{sumQty()}}</td>
        <td></td>
    </tr>
    <tr>
        <td>مجموع الاعداد مباعة بهدايا</td>
        <td>{{sumQty2()}}</td>
        <td></td>
    </tr>
    <tr>
        <td>مجموع الكلي للاعداد</td>
        <td>{{sumQty() + sumQty2()}}</td>
        <td></td>
    </tr>
    <tr>
        <td>عدد النقص</td>
        <td></td>
        <td></td>
    </tr>
    <tr>
        <td>عدد الراجع</td>
        <td></td>
        <td></td>
    </tr>
    <tr>
        <td>الصافي الاعداد</td>
        <td></td>
        <td></td>
    </tr>
    <tr>
        <td>مبلغ الاعداد قبل نقص وراجع</td>
        <td>{{totalPrice()}}</td>
        <td></td>
    </tr>
    <tr>
        <td>مبلغ النقص</td>
        <td></td>
        <td></td>
    </tr>
    <tr>
        <td>مبلغ الراجع</td>
        <td></td>
        <td></td>
    </tr>
    <tr>
        <td>صافي مبيعات كل مندوبين مفرد </td>
        <td></td>
        <td></td>
    </tr>
</table>
<table class="table" border="1" cellspacing="0" width="100%" dir="rtl">
    <tr>
        <td colspan="1">
            <table border="1" cellspacing="0" width="100%" dir="rtl">
                <tr>
                    <td width="10px">تسلسل</td>
                    <td>رقم توزيع</td>
                    <td width="200px">اسم موزع والأب</td>
                    <td width="200px">المبلغ</td>
                    <td width="200px">اسم حساب</td>
                    <td width="40%">البيان</td>
                </tr>
                <tr v-for="(x,i) in [1,1,1,1,1,1,1,1,1,1]" :key="i">
                    <td>{{i+1}}</td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                    <td></td>
                </tr>
            </table>
        </td>
    </tr>
    <tr>
        <td colspan="2" style="height: 200px;">
            ملاحظات المسؤول
        </td>
    </tr>
</table>
<br>
<br>
<span style="float: right;">توقيع واسم امين المخزن</span>
<span style="float: left;">توقيع واسم المدقق</span>
    </v-sheet>

    <v-fab-transition>
      <v-btn @click="print()" color="primary" fab large dark bottom fixed left>
        <v-icon>mdi-printer</v-icon>
      </v-btn>
    </v-fab-transition>
  </div>
</template>

<script>
import moment from "moment";
export default {
  name: "DeliveryStatus",
  data: () => ({
    deliveryStatusId: 0,
    deliveryStatus: null,
    discounts: [],
    appData: null,
  }),
  created: function () {
    this.deliveryStatusId = this.$route.params.id;
    this.fetch();

    this.$http.get(this.$baseUrl + "discount").then((res) => {
      this.discounts = res.data;
    });
    this.$http.get(this.$baseUrl + "settings").then((res) => {
      this.appData = res.data;
    });
    if (this.$route.query.print != undefined || this.$route.query.print != null) {
      setTimeout(() => {
        this.print();
      }, 2000);
    }
  },
  methods: {
    fetch() {
      let loading = this.$loading.show();
      this.$http
        .get(this.$baseUrl + "deliveryStatus/" + this.deliveryStatusId)
        .then((res) => {
          this.deliveryStatus = res.data;
        })
        .finally(() => loading.hide());
    },
    getDiscountName(id) {
      if (this.discounts.length > 0) {
        return this.discounts.filter((d) => d.idDiscount == id)[0].discountName;
      } else {
        return "";
      }
    },
    sumQty() {
      let qty = 0;
      let items = this.deliveryStatus.invoicesData.filter(
        (d) => d.discountTypeId == 0
      );
      for (let i = 0; i < items.length; i++) {
        qty = qty + items[i].count;
      }
      return qty;
    },
    sumQty2() {
      let qty = 0;
      let items = this.deliveryStatus.invoicesData.filter(
        (d) => d.discountTypeId > 0
      );
      for (let i = 0; i < items.length; i++) {
        qty = qty + items[i].count;
      }
      return qty;
    },
    totalPrice() {
      let total = 0;
      let items = this.deliveryStatus.invoicesData;
      for (let i = 0; i < items.length; i++) {
        total = total + items[i].total;
      }
      return total.toLocaleString();
    },
    fixedDate(date) {
      return (
        moment(date).format("YYYY-MM-DD") +
        " - " +
        moment(date).locale("ar").format("dddd")
      );
    },
    deliveryDate(date) {
      if (moment(date).locale("en").format("dddd") == "Thursday") {
        return (
          moment(date).add(2, "days").format("YYYY-MM-DD") +
          " - " +
          moment(date).locale("ar").add(2, "days").format("dddd")
        );
      } else {
        return (
          moment(date).add(1, "days").format("YYYY-MM-DD") +
          " - " +
          moment(date).locale("ar").add(1, "days").format("dddd")
        );
      }
    },
    currentDay() {
      return (
        moment().format("YYYY-MM-DD") +
        " - " +
        moment().locale("ar").format("dddd")
      );
    },
    print() {
        this.$print(this.$refs.print);
    }
  },
};
</script>

<style>
td,
th {
  padding: 10px;
}
th {
  background-color: #ddd;
}
.sheet {
  page-break-after: always;
  direction: rtl !important;
}
@media print{
  * {
    font-size:10px !important;
    -webkit-print-color-adjust: exact;
  }
  .v-btn {
      display: none !important;
  }
}
</style>