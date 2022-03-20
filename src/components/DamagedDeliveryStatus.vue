<template>
  <div ref="print" v-if="deliveryStatus != null" id="deliveryStatus" class="pa-10">
    <v-sheet class="pa-10 sheet" elevation="2">
      <div v-if="appData != null" class="pa-10">
        <center>
          <h2>
            كشف توزيع المواد التالفة
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
          <th>اجمالي الراجع</th>
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
          </tr>
        </template>
      </table>
    </v-sheet>
    <br />
    <v-sheet class="pa-10 sheet" elevation="2">
      <table border="1" cellspacing="0" width="100%" class="table" dir="rtl">
        <tr>
          <td>مجموع العدد : {{ sumQty() }}</td>
          <td>مجموع الهدايا : {{ sumQty2() }}</td>
          <td>مجموع كلي : {{ sumQty() + sumQty2() }}</td>
          <td>الاجمالي : {{ totalPrice() }}</td>
        </tr>
        <tr>
          <th>اسم الحساب</th>
          <th colspan="3">البيان</th>
        </tr>
        <tr>
          <td>مبلغ التوزيع الكلي</td>
          <td width="150px"></td>
          <td colspan="2"></td>
        </tr>
        <tr>
          <td>مبلغ نقص الاعداد</td>
          <td></td>
          <td colspan="2"></td>
        </tr>
        <tr>
          <td>مبلغ الراجع</td>
          <td></td>
          <td colspan="2">
            <center>
              <b>
                يجب تسليم فواتير الى امين الصندوق لأرسالها الى مسؤول التوزيع
                لمعالجة الراجع مع المندوبين خلاف ذلك يغرم الموزع
              </b>
            </center>
          </td>
        </tr>
        <tr>
          <td>مبلغ القائمة بعد نقص وراجع</td>
          <td></td>
          <td colspan="2"></td>
        </tr>
        <tr>
          <td>المستلم الفعلي</td>
          <td></td>
          <td colspan="2"></td>
        </tr>
        <tr>
          <td>م / كاز( ص / م )</td>
          <td></td>
          <td colspan="2"></td>
        </tr>
        <tr>
          <td>م/متنوعة(ص/م)</td>
          <td></td>
          <td colspan="2"></td>
        </tr>
        <tr>
          <td>التالف مبيعات ( ص / م )</td>
          <td></td>
          <td colspan="2"></td>
        </tr>
        <tr>
          <td>تعويض2(ص/م)</td>
          <td></td>
          <td colspan="2"></td>
        </tr>
        <tr>
          <td>مجموع(ص/م )</td>
          <td></td>
          <td colspan="2"></td>
        </tr>
        <tr>
          <td>ديون 1 ( د )</td>
          <td></td>
          <td colspan="2"></td>
        </tr>
        <tr>
          <td>ديون 2 ( د )</td>
          <td></td>
          <td colspan="2"></td>
        </tr>
        <tr>
          <td>ديون 3 ( د )</td>
          <td></td>
          <td colspan="2"></td>
        </tr>
        <tr>
          <td>المبلغ النهائي</td>
          <td></td>
          <td colspan="2"></td>
        </tr>
        <tr>
          <td>النقص او الفرق</td>
          <td></td>
          <td colspan="2"></td>
        </tr>
        <!---->

        <tr>
          <td colspan="4" style="height: 200px">ملاحظات امين الصندوق</td>
        </tr>
      </table>
      <br />
      <br />
      <span style="float: right">توقيع واسم الموزع</span>
      <span style="float: left">توقيع واسم امين الصندوق</span>
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

    if (
      this.$route.query.print != undefined ||
      this.$route.query.print != null
    ) {
      setTimeout(() => {
        this.$print(this.$refs.print);
        setTimeout(() => {
          this.$router.go(-1);
        }, 2000);
      }, 1000);
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

<style scoped>
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
  @page {
    size: A4 portrait;
  }
  * {
    font-size:12px !important;
    -webkit-print-color-adjust: exact;
  }
  .v-btn {
      display: none !important;
  }
}
</style>