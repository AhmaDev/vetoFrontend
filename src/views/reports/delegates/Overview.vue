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
      <center class="printHeader">
        <h2>التقرير العام</h2>
      </center>

      <v-row>
        <v-col>

          <v-menu ref="menu" v-model="menu1" :close-on-content-click="false" transition="scale-transition" offset-y
            min-width="auto">
            <template v-slot:activator="{ on, attrs }">
              <v-text-field v-model="startDate" label="تاريخ البداية" outlined dense hide-details
                prepend-inner-icon="mdi-calendar" readonly v-bind="attrs" v-on="on"></v-text-field>
            </template>
            <v-date-picker :disabled="!checkPermission('overview_date')" v-model="startDate" :max="max" :min="min"
              label="تاريخ البداية"></v-date-picker>
          </v-menu>

        </v-col>
        <v-col>

          <v-menu ref="menu" v-model="menu2" :close-on-content-click="false" transition="scale-transition" offset-y
            min-width="auto">
            <template v-slot:activator="{ on, attrs }">
              <v-text-field v-model="endDate" label="تاريخ النهاية" outlined dense hide-details
                prepend-inner-icon="mdi-calendar" readonly v-bind="attrs" v-on="on"></v-text-field>
            </template>
            <v-date-picker :disabled="!checkPermission('overview_date')" v-model="endDate" :max="max" :min="min"
              label="تاريخ النهاية"></v-date-picker>
          </v-menu>



        </v-col>
        <v-col>
          <v-autocomplete :items="supervisors" item-text="username" item-value="idUser" outlined dense hide-details
            label="المشرف" v-model="selectedSuperVisor" @change="setDelegates()"></v-autocomplete>
        </v-col>
        <v-col>
          <v-autocomplete :items="delegates" item-text="username" item-value="idUser" outlined dense hide-details
            multiple label="المندوب" v-model="selectedDelegate"></v-autocomplete>
        </v-col>
        <v-col>
          <v-autocomplete :disabled="userData.overviewSellPrice > 0" :items="sellPrices" item-text="sellPriceName"
            item-value="idSellPrice" outlined dense hide-details label="ترتيب حسب سعر البيع"
            v-model="selectedSellPrice"></v-autocomplete>
        </v-col>
        <v-col>
          <v-btn @click="search()" color="primary" block dark> بحث </v-btn>
        </v-col>
      </v-row>
      <br />
      <v-data-table :items="selectedSellPrice == 0
        ? report.data
        : report.data.filter((e) => e.sellPriceId == selectedSellPrice)
        " :items-per-page="2000" hide-default-footer :headers="report.header" multi-sort :key="forceRerender">
        <template v-slot:[`item.totalCustomers`]="{ item }">
          {{ item.totalCustomers.toLocaleString() }}
        </template>
        <template v-slot:[`item.superVisorName`]="{ item }">
          <v-chip small :key="sv" v-for="sv in getSVName(item.idUser)">
            {{ sv }}
          </v-chip>
        </template>
        <template v-slot:[`item.totalSelling`]="{ item }">
          <router-link target="_BLANK" v-if="checkPermission('overview_visits')"
            :to="'visits?delegate=' + item.idUser + '&date=' + startDate">{{ item.totalSelling.toLocaleString()
            }}</router-link>
          <div v-if="!checkPermission('overview_visits')">
            {{ item.totalSelling.toLocaleString() }}
          </div>
        </template>
        <template v-slot:[`item.totalRestores`]="{ item }">
          {{ item.totalRestores.toLocaleString() }}
        </template>
        <template v-slot:[`item.totalRemaining`]="{ item }">
          {{ item.totalRemaining.toLocaleString() }}
        </template>
        <template v-slot:[`item.totalOffers`]="{ item }">
          <router-link target="_BLANK" :to="'discounts?delegate=' + item.idUser + '&date=' + startDate">{{
            item.totalOffers.toLocaleString() }}</router-link>
        </template>
        <template v-slot:[`item.totalGifts`]="{ item }">
          {{ item.totalGifts.toLocaleString() }}
        </template>
        <template v-slot:[`item.totalDamaged`]="{ item }">
          <router-link target="_BLANK" v-if="checkPermission('overview_damaged')"
            :to="'damagedItems?delegate=' + item.idUser + '&date=' + startDate">{{ item.totalDamaged.toLocaleString()
            }}</router-link>
          <div v-if="!checkPermission('overview_damaged')">
            {{ item.totalDamaged.toLocaleString() }}
          </div>
        </template>
        <template v-slot:[`item.remain`]="{ item }">
          {{
            (
              item.totalCustomers -
              item.invoicesCount -
              item.totalVisits
            ).toLocaleString()
          }}
        </template>

        <template v-slot:[`item.invoicesCount`]="{ item }">
          <router-link v-if="checkPermission('overview_access_sales')" target="_BLANK" :to="'store?delegate=' +
            item.idUser +
            '&dateFrom=' +
            startDate +
            '&dateTo=' +
            endDate
            ">{{ item.invoicesCount.toLocaleString() }}</router-link>
          <div v-if="!checkPermission('overview_access_sales')">
            {{ item.invoicesCount.toLocaleString() }}
          </div>
        </template>
        <template v-slot:[`item.username`]="{ item }">
          <router-link v-if="checkPermission('overview_access_account')" target="_BLANK" :to="'user/' + item.idUser">{{
            item.username }}</router-link>
          <div v-if="!checkPermission('overview_access_account')">
            {{ item.username }}
          </div>
        </template>
        <template v-slot:[`item.totalVisits`]="{ item }">
          <router-link target="_BLANK" v-if="checkPermission('overview_visits')"
            :to="'visits?delegate=' + item.idUser + '&date=' + startDate">{{ item.totalVisits.toLocaleString()
            }}</router-link>
          <div v-if="!checkPermission('overview_visits')">
            {{ item.totalVisits.toLocaleString() }}
          </div>
        </template>
        <template v-slot:[`item.firstInvoiceDate`]="{ item }">
          <div>
            {{
              formatAMPM(
                compareDates(item.firstVisitDate, item.firstInvoiceDate)
              )
            }}
          </div>
        </template>
        <template v-slot:[`item.lastInvoiceDate`]="{ item }">
          <div>
            {{
              formatAMPM(
                compareDates2(item.lastVisitDate, item.lastInvoiceDate)
              )
            }}
          </div>
        </template>
        <template v-slot:[`item.timeCompare`]="{ item }">
          <div>
            {{
              startDateFixed(
                compareDates(item.firstVisitDate, item.firstInvoiceDate),
                compareDates2(item.lastVisitDate, item.lastInvoiceDate)
              ).replace("منذ", "")
            }}
          </div>
        </template>
        <template v-slot:[`item.late`]="{ item }">
          <div>
            {{
              calculateLate(item.idUser) == -1
                ? "..."
                : calculateLateDuration(calculateLate(item.idUser))
            }}
          </div>
        </template>
        <template v-slot:[`item.finalLate`]="{ item }">
          <div>
            {{
              calculateLate(item.idUser) == -1
                ? "..."
                : calculateLateDuration(
                  finalLate(
                    compareDates(item.firstVisitDate, item.firstInvoiceDate),
                    compareDates2(item.lastVisitDate, item.lastInvoiceDate),
                    calculateLate(item.idUser)
                  )
                )
            }}
          </div>
        </template>
      </v-data-table>
      <div class="pa-10  footerGrid"
        style="font-size: 14px !important; float: right; margin-top: 100px; width: 100%; margin: 30px">
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
    </v-card>
  </div>
</template>

<script>
import * as moment from "moment";
export default {
  name: "OverViewReport",
  data: () => ({
    permissions: [],
    supervisors: [],
    supervisorsDelegates: [],
    delegates: [],
    startDate: "",
    sellPrices: [],
    userData: null,
    endDate: "",
    min: "2020-01-01",
    max: "2030-01-01",
    forceRerender: 0,
    menu1: null,
    menu2: null,
    selectedSuperVisor: 0,
    selectedDelegate: 0,
    selectedSellPrice: 0,
    report: {
      data: [],
      header: [
        { text: "سعر البيع", value: "sellPriceName" },
        { text: "اسم المندوب", value: "username" },
        // { text: "المنطقة", value: "address" },
        { text: "المشرفين", value: "superVisorName" },
        { text: "عدد الزبائن", value: "totalCustomers" },
        { text: "فواتير البيع", value: "invoicesCount" },
        { text: "الزيارات", value: "totalVisits" },
        { text: "المتبقي", value: "remain" },
        // { text: "عدد المعاميل", value: "activeCustomers" },
        { text: "مبيعات اجمالية", value: "totalSelling" },
        { text: "راجع المبيعات", value: "totalRestores" },
        { text: "فواتير الراجع", value: "restoresCount" },
        { text: "الصافي", value: "totalRemaining" },
        { text: "مبلغ التالف", value: "totalDamaged" },
        { text: "مبلغ الهدايا", value: "totalGifts" },
        { text: "مبلغ العروض", value: "totalOffers" },
        { text: "بداية العمل", value: "firstInvoiceDate" },
        { text: "نهاية العمل", value: "lastInvoiceDate" },
        { text: "الفرق", value: "timeCompare" },
        { text: "التأخير", value: "late" },
        { text: "الصافي", value: "finalLate" },
      ],
    },
    delegatesWork: [],
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
    this.$http.get(this.$baseUrl + "users/role/3").then((res) => {
      this.supervisors = res.data;
    });
    this.$http.get(this.$baseUrl + "supervisorDelegates").then((res) => {
      this.supervisorsDelegates = res.data;
    });
    this.$http.get(this.$baseUrl + "sellPrice").then((res) => {
      this.sellPrices = res.data;
    });
    this.$http.get(this.$baseUrl + "users").then((res) => {
      this.delegates = res.data;
    });
    this.$http.get(this.$baseUrl + 'users/userinfo/' + this.userInfo.idUser).then((perms) => {
      this.userData = perms.data;
      console.log(this.userData);
      this.selectedSellPrice = this.userData.overviewSellPrice;
      if (this.userData.unlockOverviewReport == 1) {
        this.min = moment(this.userData.ovStartDate).format('YYYY-MM-DD');
        this.max = moment(this.userData.ovEndDate).format('YYYY-MM-DD');

        // this.startDate = this.max;
        // this.endDate = this.max;
        // this.fetch();
      } else {
        this.getCurrentDate().then((value) => {
          this.startDate = value;
          this.endDate = value;
          // this.fetch();
        });
      }
    });
    // LOAD PERMS END

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
        .get(
          this.$baseUrl +
          "reports/overviewHuge-new?days=" +
          JSON.stringify(this.getDays(this.startDate, this.endDate)).slice(
            1,
            -1
          )
        )
        .then((res) => {
          this.report.data = res.data;
          this.delegatesWork = [];
          for (let i = 0; i < this.report.data.length; i++) {
            const user = this.report.data[i];
            this.$http
              .get(
                this.$baseUrl +
                "supervisorDelegates/delegate/" +
                user.idUser +
                "?date=" +
                this.startDate
              )
              .then((workRes) => {
                this.delegatesWork.push({
                  userId: user.idUser,
                  data: workRes.data,
                });
                console.log(user.idUser, this.delegatesWork);
              });
          }
          console.log(this.report.data);
        })
        .finally(() => loading.hide());


    },
    getSVName(id) {
      let sv = this.supervisorsDelegates.filter((e) => e.delegateId == id);
      if (sv.length > 0) {
        let svs = [];
        for (let i = 0; i < sv.length; i++) {
          let userSV = this.supervisors.filter(
            (e) => e.idUser == sv[i].supervisorId
          );
          for (let j = 0; j < userSV.length; j++) {
            if (userSV[j].isMainSupervisor == 1) {
              svs.push(userSV[j].username);
            }
          }
        }
        return svs;
      } else {
        return [];
      }
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
        q =
          q +
          "&delegateId=" +
          JSON.stringify(this.selectedDelegate).slice(1, -1);
      }
      let loading = this.$loading.show();
      this.$http
        .get(
          this.$baseUrl +
          "reports/overviewHuge-new?" +
          q +
          "&days=" +
          JSON.stringify(this.getDays(this.startDate, this.endDate)).slice(
            1,
            -1
          )
        )
        .then((res) => {
          console.log('ovd', res.data);

          this.report.data = res.data;
          for (let i = 0; i < this.report.data.length; i++) {
            const user = this.report.data[i];
            this.delegatesWork = [];
            this.$http
              .get(
                this.$baseUrl +
                "supervisorDelegates/delegate/" +
                user.idUser +
                "?date=" +
                this.startDate
              )
              .then((workRes) => {
                this.delegatesWork.push({
                  userId: user.idUser,
                  data: workRes.data,
                });
                console.log(user.idUser, this.delegatesWork);
              });
          }
          console.log(this.report.data);
        })
        .finally(() => loading.hide());
    },
    sum(columnName) {
      let sum = 0;
      let table =
        this.selectedSellPrice == 0
          ? this.report.data
          : this.report.data.filter(
            (e) => e.sellPriceId == this.selectedSellPrice
          );
      for (let i = 0; i < table.length; i++) {
        sum = sum + table[i][columnName];
      }
      return sum.toLocaleString();
    },
    setDelegates() {
      let loading = this.$loading.show();
      this.$http
        .get(
          this.$baseUrl +
          "supervisorDelegates/userid/" +
          this.selectedSuperVisor
        )
        .then((res) => {
          this.selectedDelegate = res.data.map((e) => e.delegateId);
          this.selectedDelegate.push(this.selectedSuperVisor);
        })
        .finally(() => loading.hide());
    },
    startDateFixed(datex, firstDate) {
      // return moment(datex).locale("ar").from(moment(firstDate));
      let d1 = new Date(datex);
      let d2 = new Date(firstDate);
      let d = d2 - d1;
      let tempTime = moment.duration(d);
      return tempTime.hours() + "ساعات و " + tempTime.minutes() + " دقيقة";
    },
    getDays(from, to) {
      var d = new Date(from),
        a = [],
        y = [
          "sunday",
          "monday",
          "tuesday",
          "wednesday",
          "thursday",
          "friday",
          "saturday",
        ];
      to = new Date(to);
      while (d < to) {
        a.push(y[d.getDay()]);
        d.setDate(d.getDate() + 1);
      }
      if (d.getDay() === to.getDay())
        // include last day
        a.push(y[d.getDay()]);
      return a;
    },
    formatAMPM(x) {
      if (x == null || x == undefined) {
        return "";
      }
      let date = new Date(x);
      var hours = date.getHours();
      var minutes = date.getMinutes();
      var ampm = hours >= 12 ? "م" : "ص";
      hours = hours % 12;
      hours = hours ? hours : 12; // the hour '0' should be '12'
      minutes = minutes < 10 ? "0" + minutes : minutes;
      var strTime =
        hours + ":" + minutes + ":" + date.getSeconds() + " " + ampm;
      return strTime;
    },
    compareDates(d1, d2) {
      let date1 = new Date(d1);
      let date2 = new Date(d2);
      if (d1 == undefined || d1 == null) {
        return date2;
      }
      if (d2 == undefined || d2 == null) {
        return date1;
      }
      if (d1 == null && d2 == null) {
        return "";
      }
      if (date1 < date2) {
        return date1;
      } else {
        return date2;
      }
    },
    compareDates2(d1, d2) {
      let date1 = new Date(d1);
      let date2 = new Date(d2);
      if (date1 > date2) {
        return date1;
      } else {
        return date2;
      }
    },
    calculateLate(userId) {
      let work = this.delegatesWork.filter((e) => e.userId == userId);
      if (work.length == 0) {
        return -1;
      } else {
        let time = 0;
        for (let i = 0; i < work[0].data.length - 1; i++) {
          const element = work[0].data[i];
          if (element.length < 2) {
            return -2;
          }
          let date1 = new Date(element.createdAt);
          let date2 = new Date(work[0].data[i + 1].createdAt);
          const diffTime = Math.abs(date2 - date1);
          if (diffTime > 900000) {
            // 15 MINUTES
            time = time + diffTime - 900000;
          }
        }
        return time;
      }
    },
    calculateLateDuration(millisecond) {
      let tempTime = moment.duration(millisecond);
      return tempTime.hours() + "ساعات و " + tempTime.minutes() + " دقيقة";
    },
    finalLate(startDate, endDate, late) {
      let sDate = new Date(startDate);
      let eDate = new Date(endDate);
      const diffTime = Math.abs(eDate - sDate);
      return diffTime - late;
    },
  },
  computed: {
    isLoggedIn() {
      return this.$store.getters.isLoggedIn;
    },
    userInfo() {
      return this.$store.getters.getLoginInfo;
    },
  },
};
</script>

<style scoped>
a {
  text-decoration: none;
}

.footerGrid .col {
  border: 1px grey solid !important;
}

.printHeader {
  display: none !important;
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
    zoom: 0.8 !important;
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