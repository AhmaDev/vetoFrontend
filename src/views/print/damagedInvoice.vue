<template>
  <div ref="print" id="homePage" class="pa-10">
    <template v-for="(invoice, index) in invoices">
      <v-sheet
        v-if="invoice.items[0] != null"
        style="margin-bottom: 20px"
        color="white"
        :key="invoice.idInvoice"
        class="pa-10 sheet"
        elevation="4"
      >
        <img
          v-if="$baseUrl.includes('mmlka')"
          src="@/assets/header.jpg"
          width="100%"
          alt=""
        />
        <img
          v-if="$baseUrl.includes('sultan')"
          src="@/assets/header2.jpg"
          width="100%"
          alt=""
        />
        <small>تسلسل: {{ index + 1 }}</small>
        <table class="table" border="1" cellspacing="0" width="100%">
          <tr>
            <td>رقم الفاتورة : #{{ invoice.idDamagedItemsInvoice }}</td>
            <td>فاتورة مواد تالفة</td>
            <td colspan="2">المندوب : {{ invoice.createdByName }}</td>
          </tr>
          <tr>
            <td>اسم الزبون : {{ invoice.customerName }}</td>
            <td>كود الزبون : {{ invoice.customerId }}</td>
            <td>رقم الزبون : {{ invoice.phone }}</td>
            <td>عنوان الزبون : {{ invoice.nearby }}</td>
          </tr>
          <tr>
            <td colspan="3">عنوان الزبون : {{ invoice.provinceName }}</td>
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
              <th>سعر الوحدة</th>
              <th>الاجمالي</th>
              <th>العدد</th>
              <th>المبلغ</th>
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
              <td>{{ item.totalPrice.toLocaleString() }}</td>
              <td></td>
              <td></td>
            </tr>
          </tbody>
          <tfoot>
            <tr>
              <td colspan="3">
                مجموع القطع:
                {{
                  invoice.items
                    .reduce((a, b) => a + b.count, 0)
                    .toLocaleString()
                    .toLocaleString()
                }}
              </td>
              <td>المجموع</td>
              <td>
                {{
                  invoice.items
                    .reduce((a, b) => a + b.totalPrice, 0)
                    .toLocaleString()
                    .toLocaleString()
                }}
              </td>
              <td></td>
              <td></td>
            </tr>
          </tfoot>
        </table>
        <br />
        <pre
          v-if="$baseUrl.includes('mmlka')"
          style="text-align: right; white-space: pre-wrap; width: 100%"
        >
ملاحظة1: الشركة غير مسؤولة عن حماية العروض المواد داخل فاتورة وما عدها الشركة تحمي جميع المواد المدرجة في قائمة البيع الخاصة ب مملكة بغداد .
ملاحظة2:- قبل خروج الموزع يجب على الزبون جرد البضاعة والتأكد من الفاتورة وخلاف ذلك الشركة غير مسؤولة عن أي نقص .            
ملاحظة 3 :- الشركة غير مسؤولة عن إعطاء للمندوب او الموزع او أي شخص يمثل الشركة مملكة بغداد مبالغ او غيرها من أمور خارج نطاق العمل وفي حالة حدوث ذلك اتصال بالأداة .                 
ملاحظة 4 :- يجب الاحتفاظ في فاتورة بيع مملكة بغداد وهذا يمثل لك الحق في مطالبة أي تلف وفي حال لم تحصل على تعويض مراسلة الشركة في الأرقام المذكورة أعلاه . 
          </pre
        >
        <pre
          v-if="$baseUrl.includes('sultan')"
          style="text-align: right; white-space: pre-wrap; width: 100%"
        >
ملاحظة :- الشركة غير مسؤولة عن أي تسديد بدون وصل صادر من الشركة
ملاحظة 2:الشركة غير مسؤولة عن حماية العروض المواد داخل فاتورة وما عدها الشركة تحمي جميع المدرجة في قائمة البيع
ملاحظة 3 -:قبل خروج الموزع يجب على زبون جرد بضاعة وتأكد من فاتورة وخالف ذلك الشركة غير مسؤولة .
ملاحظة 4 -: الشركة غير مسؤولة عن إعطاء للمندوب او الموزع او أي شخص يمثل الشركة سلطان العين مبالغ او
غيرها من أمور خارج نطاق العمل وفي حالة حدوث ذلك اتصال باألدارة .
        </pre>
        <br />
        <br />
        توقيع الزبون
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
      .post(this.$baseUrl + "damagedInvoice/multiple", {
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
  * {
    font-size: 12px !important;
  }
  .sheet {
    display: block;
  }
}
</style>