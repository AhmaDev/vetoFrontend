<template>
  <div id="overview" class="pa-10">
    <v-app-bar app>
      <v-toolbar-title>تقرير شامل</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn @click="$print($refs.print)" color="success" dark>
        <v-icon>la-print</v-icon>
        طباعة
      </v-btn>
      <!-- <download-excel :data="report.data">
        Download Data
      </download-excel> -->
    </v-app-bar>

    <v-card ref="print" class="pa-10">
            <center class="printHeader"><h2>التقرير العام</h2></center>

      <v-row>
        <v-col>
          <v-text-field
            type="date"
            outlined
            dense
            hide-details
            label="تاريخ البداية"
            v-model="startDate"
          ></v-text-field>
        </v-col>
        <v-col>
          <v-text-field
            type="date"
            outlined
            dense
            hide-details
            label="تاريخ النهاية"
            v-model="endDate"
          ></v-text-field>
        </v-col>
        <v-col>
          <v-autocomplete
            :items="supervisors"
            item-text="username"
            item-value="idUser"
            outlined
            dense
            hide-details
            label="المشرف"
            v-model="selectedSuperVisor"
            @change="setDelegates()"
          ></v-autocomplete>
        </v-col>
        <v-col>
          <v-autocomplete
            :items="delegates"
            item-text="username"
            item-value="idUser"
            outlined
            dense
            hide-details
            multiple
            label="المندوب"
            v-model="selectedDelegate"
          ></v-autocomplete>

        </v-col>
        <v-col>
          <v-btn @click="search()" color="primary" block dark> بحث </v-btn>
        </v-col>
      </v-row>
      <br />
      <v-data-table
        :items="report.data"
        :items-per-page="2000"
        hide-default-footer
        :headers="report.header"
        multi-sort
      >
        <template v-slot:[`item.totalCustomers`]="{ item }">
          {{ item.totalCustomers.toLocaleString() }}
        </template>
        <template v-slot:[`item.totalSelling`]="{ item }">
          {{ item.totalSelling.toLocaleString() }}
        </template>
        <template v-slot:[`item.totalRestores`]="{ item }">
          {{ item.totalRestores.toLocaleString() }}
        </template>
        <template v-slot:[`item.totalRemaining`]="{ item }">
          {{ item.totalRemaining.toLocaleString() }}
        </template>
        <template v-slot:[`item.totalOffers`]="{ item }">
          {{ item.totalOffers.toLocaleString() }}
        </template>
        <template v-slot:[`item.totalGifts`]="{ item }">
          {{ item.totalGifts.toLocaleString() }}
        </template>
        <template v-slot:[`item.totalDamaged`]="{ item }">
          {{ item.totalDamaged.toLocaleString() }}
        </template>

        <template v-slot:footer>
          <div class="pa-10 footerGrid" style="font-size: 14px !important">
            <v-row>
              <v-col> عدد الزبائن <br />{{ sum("totalCustomers") }} </v-col>
              <v-col> عدد الفواتير <br />{{ sum("invoicesCount") }} </v-col>
              <v-col> عدد الراجع <br />{{ sum("restoresCount") }} </v-col>
              <v-col> مجموع الفواتير <br />{{ sum("totalSelling") }} </v-col>
              <v-col> مجموع الراجع <br />{{ sum("totalRestores") }} </v-col>
              <v-col> مجموع الهدايا <br />{{ sum("totalGifts") }} </v-col>
              <v-col> مجموع العروض <br />{{ sum("totalOffers") }} </v-col>
              <v-col> مجموع التالف <br />{{ sum("totalDamaged") }} </v-col>
              <v-col class="success white--text">
                الاجمالي <br />{{ sum("totalRemaining") }}
              </v-col>
            </v-row>
          </div>
        </template>
      </v-data-table>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "OverViewReport",
  data: () => ({
    permissions: [],
    supervisors: [],
    delegates: [],
    startDate: "",
    endDate: "",
    selectedSuperVisor: 0,
    selectedDelegate: 0,
    report: {
      data: [],
      header: [
        { text: "سعر البيع", value: "sellPriceName" },
        { text: "اسم المندوب", value: "username" },
        { text: "المنطقة", value: "address" },
        { text: "المشرف", value: "superVisorName" },
        { text: "عدد الزبائن", value: "totalCustomers" },
        { text: "فواتير البيع", value: "invoicesCount" },
        { text: "فواتير الراجع", value: "restoresCount" },
        { text: "مبيعات اجمالية", value: "totalSelling" },
        { text: "راجع المبيعات", value: "totalRestores" },
        { text: "الصافي", value: "totalRemaining" },
        { text: "مبلغ العروض", value: "totalOffers" },
        { text: "مبلغ الهدايا", value: "totalGifts" },
        { text: "مبلغ التالف", value: "totalDamaged" },
      ],
    },
  }),
  created: function () {
    // LOAD PERMS START
    this.auth().then((res) => {
      this.permissions = res.permissions;
      // CHECK IF CAN SEE THIS PAGE
      if (!this.checkPermission("overview")) {
        this.$toast.open({
          type: "error",
          message: "غير مصرح لك بمشاهدة هذه الصفحة",
          duration: 3000,
        });
        this.$router.go(-1);
      }
    });
    // LOAD PERMS END
    this.getCurrentDate().then((value) => {
      this.startDate = value;
      this.endDate = value;
    });
    this.fetch();
  },
  methods: {
    checkPermission(permissionKey) {
      var isAuthorized = this.permissions.filter(
        (p) => p.permissionKey == permissionKey
      );
      if (isAuthorized.length > 0) return true;
      else return false;
    },
    fetch() {
      let loading = this.$loading.show();
      this.$http
        .get(this.$baseUrl + "reports/overview")
        .then((res) => {
          this.report.data = res.data;
          console.log(1);
        })
        .finally(() => loading.hide());

      this.$http.get(this.$baseUrl + "users/role/3").then((res) => {
        this.supervisors = res.data;
      });
      this.$http.get(this.$baseUrl + "users").then((res) => {
        this.delegates = res.data;
      });
    },
    search() {
      var q = "";
      if (this.startDate == "" || this.endDate == "") {
        this.$toast.open({
          type: "warning",
          message: "يرجى اختيار تاريخ بداية ونهاية",
          duration: 3000,
        });
        return;
      } else {
        q = "from=" + this.startDate + "&to=" + this.endDate;
      }
      if (this.selectedDelegate.length > 0) {
        q = q + "&delegateId=" + JSON.stringify(this.selectedDelegate).slice(1, -1);
      }
      let loading = this.$loading.show();
      this.$http
        .get(this.$baseUrl + "reports/overview?" + q)
        .then((res) => {
          this.report.data = res.data;
          console.log(this.report.data);
        })
        .finally(() => loading.hide());
    },
    sum(columnName) {
      let sum = 0;
      for (let i = 0; i < this.report.data.length; i++) {
        sum = sum + this.report.data[i][columnName];
      }
      return sum.toLocaleString();
    },
    setDelegates() {
      let loading = this.$loading.show();
      this.$http.get(this.$baseUrl + "supervisorDelegates/userid/" + this.selectedSuperVisor).then((res) => {
        this.selectedDelegate = res.data.map(e => e.delegateId)
        this.selectedDelegate.push(this.selectedSuperVisor)
      }).finally(() => loading.hide())
    }
  },
};
</script>

<style scoped>
.footerGrid .col {
  border: 1px grey solid !important;
}
 .printHeader {
    display:none !important;
  }
@media print {
  .printHeader {
    display: block !important;
    padding: 10px;
  }
  @page {
    size: A4 landscape;
  }
  * {
    direction: rtl !important;
    color-adjust: exact !important;
    zoom: 0.9 !important;
  }
  .v-btn {
    display: none !important;
  }
  .v-data-table__wrapper {
    border: 1px #000000 solid !important;
  }
  .v-card {
    box-shadow: none !important;
  }
}
</style>