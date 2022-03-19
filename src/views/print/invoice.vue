<template>
  <div ref="print" id="homePage" class="pa-10">
    <template v-for="invoice in invoices">
      <v-sheet
        v-if="invoice.items[0] != null"
        style="margin-bottom: 20px"
        color="white"
        :key="invoice.idInvoice"
        class="pa-10 sheet"
        elevation="4"
      >
        <img src="@/assets/header.jpg" width="100%" alt="" />
        <table class="table" border="1" cellspacing="0" width="100%">
          <tr>
            <td>رقم الفاتورة : #{{ invoice.idInvoice }}</td>
            <td>فاتورة : {{ invoice.invoiceTypeName }}</td>
            <td>المندوب : {{ invoice.createdByName }}</td>
            <td>الموزع : {{ invoice.deliveryName }}</td>
          </tr>
          <tr>
            <td>اسم الزبون : {{ invoice.customerName }}</td>
            <td>كود الزبون : {{ invoice.customerId }}</td>
            <td>رقم الزبون : {{ invoice.customerPhone }}</td>
            <td rowspan="2">عنوان الزبون : {{ invoice.customerAddress }}</td>
          </tr>
          <tr>
            <td colspan="2">اسم المحل : {{ invoice.storeName }}</td>
            <td>رقم الزبون : {{ invoice.secondCustomerPhone }}</td>
          </tr>
          <tr>
            <td colspan="3">عنوان الزبون : {{ invoice.customerAddress }}</td>
            <td>
              وقت وتاريخ : {{ invoice.creationFixedDate }} -
              {{ invoice.creationFixedTime }}
            </td>
          </tr>
        </table>
        <br />
        <table class="table" border="1" cellspacing="0" width="100%">
          <thead>
            <tr>
              <th>#</th>
              <th>المادة</th>
              <th>الكمية</th>
              <th>سعر</th>
              <th>الخصم</th>
              <th>نوع الخصم</th>
              <th>الاجمالي</th>
              <th width="60px">عدد</th>
              <th width="60px">مجموع</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="(item, index) in invoice.items"
              :key="item.itemId + '_' + index"
            >
              <td>{{ index + 1 }}</td>
              <td>{{ item.itemName }}</td>
              <td>{{ item.count.toLocaleString() }}</td>
              <td>{{ item.price.toLocaleString() }}</td>
              <td>{{ item.discount }}</td>
              <td>{{ item.discountName }}</td>
              <td>{{ item.total.toLocaleString() }}</td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="5"></td>
              <td>المجموع</td>
              <td>{{ invoice.totalPrice.toLocaleString() }}</td>
              <td></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
        <br />
        <pre style="text-align: right; white-space: pre-wrap; width: 100%">
ملاحظة :- الشركة غير مسؤولة عن أي تسديد بدون وصل صادر من الشركة .
ملاحظة2: الشركة غير مسؤولة عن حماية العروض المواد داخل فاتورة وما عدها الشركة تحمي جميع المواد المدرجة في قائمة البيع الخاصة ب مملكة بغداد .
ملاحظة 3:- قبل خروج الموزع يجب على الزبون جرد البضاعة والتأكد من الفاتورة وخلاف ذلك الشركة غير مسؤولة عن أي نقص .            
ملاحظة 4 :- الشركة غير مسؤولة عن إعطاء للمندوب او الموزع او أي شخص يمثل الشركة مملكة بغداد مبالغ او غيرها من أمور خارج نطاق العمل وفي حالة حدوث ذلك اتصال بالأداة .                 
ملاحظة 5 :- يجب الاحتفاظ في فاتورة بيع مملكة بغداد وهذا يمثل لك الحق في مطالبة أي تلف وفي حال لم تحصل على تعويض مراسلة الشركة في الأرقام المذكورة أعلاه . 
          </pre
        >
      </v-sheet>
    </template>
  </div>
</template>

<script>
export default {
  name: "InvoicePrint",
  data: () => ({
    invoicesIds: [],
    invoices: [],
  }),
  created: function () {
    let invoicesIds = this.$route.params.id;
    let ids = invoicesIds.split(",");
    for (let i = 0; i < ids.length; i++) {
      this.invoicesIds.push(ids[i]);
    }
    let loading = this.$loading.show();
    this.$http
      .post(this.$baseUrl + "invoice/multiple", {
        invoices: this.invoicesIds,
      })
      .then((res) => {
        this.invoices = res.data;
        this.invoices.forEach((element) => {
          console.log(element.items);
        });
        setTimeout(() => {
          this.$print(this.$refs.print);
          setTimeout(() => {
            this.$router.go(-1);
          }, 2000);
        }, 1000);
      })
      .finally(() => loading.hide());
  },
};
</script>

<style scoped>
.table td {
  padding: 10px !important;
}
.sheet {
  page-break-after: always;
  direction: rtl !important;
  display: none;
}
@media print {
  @page {
    size: A4;
  }
  * {
    font-size: 12px !important;
  }
  .sheet {
    display: block;
  }
}
</style>