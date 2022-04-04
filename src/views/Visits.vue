<template>
  <div id="visits" class="pa-10">
    <v-app-bar app>
      <v-toolbar-title>كشف المسار</v-toolbar-title>
      <v-spacer></v-spacer>
      <v-btn
        @click="
          cols = 12;
          $print($refs.print);
        "
        color="success"
        dark
      >
        <v-icon>la-print</v-icon>
        طباعة
      </v-btn>
    </v-app-bar>

    <v-card ref="print" class="pa-10">
      <center class="printHeader"><h2>رسم المسار</h2></center>

      <v-row>
        <v-col>
          <v-autocomplete
            v-model="selectedDelegate"
            :items="delegates"
            item-text="username"
            item-value="idUser"
            outlined
            label="اختيار مندوب"
            dense
          >
          </v-autocomplete>
        </v-col>
        <v-col>
          <v-text-field dense v-model="from" outlined label="بتاريخ" type="date">
          </v-text-field>
        </v-col>
        <v-col class="no-print" cols="8">
          <v-btn width="200" @click="selectDelegate()" color="primary"> بحث </v-btn>
        </v-col>
        <v-col class="no-print" cols="3">
          <v-checkbox v-model="show.invoices" label="عرض المبيعات"></v-checkbox>
        </v-col>
        <v-col class="no-print" cols="3">
          <v-checkbox v-model="show.visits" label="عرض الزيارات"></v-checkbox>
        </v-col>
        <v-col class="no-print" cols="3">
          <v-checkbox v-model="show.restores" label="عرض الراجع"></v-checkbox>
        </v-col>
        <v-col class="no-print" cols="3">
          <v-checkbox v-model="show.damaged" label="عرض التالف"></v-checkbox>
        </v-col>
        <!-- <v-col cols="12">
          <v-btn-toggle v-model="selectedDay">
            <v-btn @click="filterData('all')">الكل</v-btn>
            <v-btn @click="filterData('sunday')">
              الاحد
              <v-chip class="mx-2" color="primary" small>
                {{ getNumberOfWeekDays(0) }}
              </v-chip>
            </v-btn>
            <v-btn @click="filterData('monday')"
              >الاثنين<v-chip class="mx-2" color="primary" small>
                {{ getNumberOfWeekDays(1) }}
              </v-chip></v-btn
            >
            <v-btn @click="filterData('tuesday')"
              >الثلاثاء<v-chip class="mx-2" color="primary" small>
                {{ getNumberOfWeekDays(2) }}
              </v-chip></v-btn
            >
            <v-btn @click="filterData('wednesday')"
              >الاربعاء<v-chip class="mx-2" color="primary" small>
                {{ getNumberOfWeekDays(3) }}
              </v-chip></v-btn
            >
            <v-btn @click="filterData('thursday')"
              >الخميس<v-chip class="mx-2" color="primary" small>
                {{ getNumberOfWeekDays(4) }}
              </v-chip></v-btn
            >
            <v-btn @click="filterData('friday')"
              >الجمعة<v-chip class="mx-2" color="primary" small>
                {{ getNumberOfWeekDays(5) }}
              </v-chip></v-btn
            >
            <v-btn @click="filterData('saturday')"
              >السبت<v-chip class="mx-2" color="primary" small>
                {{ getNumberOfWeekDays(6) }}
              </v-chip></v-btn
            >
          </v-btn-toggle>
        </v-col> -->
      </v-row>
      <v-row>
        <v-col>
          <h5>
            المبيعات :
            {{
              invoices.reduce((a, b) => a + b.totalPrice, 0).toLocaleString()
            }}
          </h5>
        </v-col>
        <v-col>
          <h5>
            الراجع :
            {{
              restores.reduce((a, b) => a + b.totalPrice, 0).toLocaleString()
            }}
          </h5>
        </v-col>
        <v-col>
          <h5>
            التالف :
            {{ damaged.reduce((a, b) => a + b.total, 0).toLocaleString() }}
          </h5>
        </v-col>
        <v-col>
          <h5>
            الزبائن :
            {{ customers.length }}
          </h5>
        </v-col>
        <v-col>
          <h5>
            عدد الفواتير :
            {{ invoices.length }}
          </h5>
        </v-col>
        <v-col>
          <h5>
            تم زيارتهم :
            {{ visits.length }}
          </h5>
        </v-col>
        <v-col>
          <h5>
            المتبقي :
            {{ customers.length - visits.length - invoices.length }}
          </h5>
        </v-col>
      </v-row>
      <br />
      <v-divider></v-divider>

      <v-row>
        <v-col v-if="show.invoices" :cols="cols">
          <h4>فواتير البيع</h4>
          <br />
          <v-data-table
            :items-per-page="300"
            :items="invoices"
            :headers="invoicesTableHeaders"
            hide-default-footer
            :height="cols == 12 ? 'auto' : 300"
            multi-sort
            class="table-striped"
            
          >
          <template v-slot:[`item.totalPrice`]="{ item }">
              {{item.totalPrice.toLocaleString()}}
            </template>
          </v-data-table>
          <hr style="border: 2px #000000 solid" />
        </v-col>
        <v-divider vertical></v-divider>

        <v-col  v-if="show.restores"  :cols="cols">
          <h4>فواتير الراجع</h4>
          <br />

          <v-data-table
            :items-per-page="300"
            :items="restores"
            :headers="restoresTableHeaders"
            hide-default-footer
            :height="cols == 12 ? 'auto' : 300"
            multi-sort
          >
            <template v-slot:[`item.totalPrice`]="{ item }">
              {{item.totalPrice.toLocaleString()}}
            </template>
          </v-data-table>
          <hr style="border: 2px #000000 solid" />
        </v-col>
        <v-divider vertical></v-divider>
        <v-col  v-if="show.damaged"  :cols="cols">
          <h4>فواتير التالف</h4>
          <br />

          <v-data-table
            :items-per-page="300"
            :items="damaged"
            :headers="damagedTableHeaders"
            hide-default-footer
            :height="cols == 12 ? 'auto' : 300"
            multi-sort
          >
          </v-data-table>
          <hr style="border: 2px #000000 solid" />
        </v-col>
        <v-divider vertical></v-divider>
        <v-col  v-if="show.visits"  :cols="cols">
          <h4>الزيارات</h4>
          <br />

          <v-data-table
            :items-per-page="300"
            :items="visits"
            :headers="tableHeaders"
            hide-default-footer
            :height="cols == 12 ? 'auto' : 300"
            multi-sort
          >
            <template v-slot:[`item.actions`]="{ item }">
              <v-btn
                @click="setMarker(item)"
                small
                color="primary"
                :key="item.idVisit"
              >
                عرض على الخريطة
              </v-btn>
            </template>
          </v-data-table>
          <hr style="border: 2px #000000 solid" />
        </v-col>
      </v-row>
    </v-card>

    <v-dialog v-model="mapDialog" width="500">
      <v-card>
        <l-map
          ref="myMap"
          style="height: 500px"
          :zoom="map.zoom"
          :center="map.center"
        >
          <l-tile-layer
            :url="map.url"
            :attribution="map.attribution"
          ></l-tile-layer>
          <l-marker
            :key="marker.idVisit"
            :lat-lng="[marker.latitude, marker.longitude]"
          >
          </l-marker>
        </l-map>
      </v-card>
    </v-dialog>
  </div>
</template>

<script>
export default {
  name: "Visits",
  components: {},
  data: () => ({
    permissions: [],
    mapDialog: false,
    delegates: [],
    cols: 12,
    selectedDelegate: 0,
    from: "",
    to: "",
    visits: [],
    invoices: [],
    damaged: [],
    restores: [],
    allVisits: [],
    allInvoices: [],
    allDamaged: [],
    allRestores: [],
    customers: [],
    allCustomers: [],
    show: {
      invoices: true,
      visits: true,
      restores: true,
      damaged: true,
    },
    selectedDay: 0,
    tableHeaders: [
      { text: "الزبون", value: "storeName" },
      { text: "كود الزبون", value: "customerId" },
      { text: "اسم الزبون", value: "customerName" },
      { text: "سبب الزيارة", value: "visitCauseName" },
      { text: "الاجراءات", value: "actions" },
    ],
    invoicesTableHeaders: [
      { text: "الزبون", value: "storeName" },
      { text: "كود الزبون", value: "customerId" },
      { text: "اسم الزبون", value: "customerName" },
      { text: "الوقت", value: "creationFixedTime" },
      { text: "المبلغ", value: "totalPrice" },
    ],
    restoresTableHeaders: [
      { text: "الزبون", value: "storeName" },
      { text: "كود الزبون", value: "customerId" },
      { text: "اسم الزبون", value: "customerName" },
      { text: "الوقت", value: "creationFixedTime" },
      { text: "المبلغ", value: "totalPrice" },
    ],
    damagedTableHeaders: [
      { text: "الزبون", value: "storeName" },
      { text: "كود الزبون", value: "customerId" },
      { text: "اسم الزبون", value: "customerName" },
      { text: "الوقت", value: "creationFixedTime" },
      { text: "المبلغ", value: "total" },
    ],
    map: {
      url: "https://mt0.google.com/vt/lyrs=m&x={x}&y={y}&z={z}",
      attribution: "veto",
      zoom: 12,
      center: [33.4, 44.3],
      markerLatLng: [33.4, 44.3],
    },
    marker: {
      idVisit: 0,
      latitude: 0,
      longitude: 0,
    },
  }),
  watch: {
    sheetMap: function (val) {
      if (val == true) {
        this.$nextTick(() => {
          this.$refs.myMap.forceRerender();
          console.log(this.$refs);
        });
      }
    },
  },
  created: function () {
    // LOAD PERMS START
    this.auth().then((res) => {
      this.permissions = res.permissions;
      // CHECK IF CAN SEE THIS PAGE
      if (!this.checkPermission("visits")) {
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
      this.from = value;
      this.to = value;
    });
    this.getCurrentDate().then((value) => {
      this.selectedDate = value;
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
    fetch: function () {
      this.$http.get(this.$baseUrl + "users").then((res) => {
        this.delegates = res.data;
      });
    },
    setMarker(marker) {
      this.marker = marker;
      this.mapDialog = true;
      this.map.center = [marker.latitude, marker.longitude];
      this.$nextTick(() => {
        setTimeout(() => {
          this.$refs.myMap.mapObject.invalidateSize();
        }, 500);
      });
    },
    selectDelegate() {
      if (this.selectedDelegate < 1) {
        this.$toast.open({
          type: "warning",
          message: "يرجى اختيار مندوب",
          duration: 3000,
        });
        return;
      }
      if (this.selectedDate == "") {
        this.$toast.open({
          type: "warning",
          message: "يرجى اختيار تاريخ",
          duration: 3000,
        });
        return;
      }
      let dayname = new Date(this.from).toLocaleDateString('us-EN', { weekday: 'long' }).toLowerCase();
      let loading = this.$loading.show();
      this.$http
        .get(
          this.$baseUrl +
            "visit/user/" +
            this.selectedDelegate +
            "?dateFrom=" +
            this.from +
            "&dateTo=" +
            this.from
        )
        .then((res) => {
          this.visits = res.data;
          this.allVisits = res.data;
        })
        .finally(() => loading.hide());

      this.$http
        .get(
          this.$baseUrl +
            "invoice/filter?user=" +
            this.selectedDelegate +
            "&dateRangeFrom=" +
            this.from +
            "&dateRangeTo=" +
            this.to +
            "&type=1"
        )
        .then((res) => {
          this.invoices = res.data;
          this.allInvoices = res.data;
        });
      this.$http
        .get(
          this.$baseUrl +
            "invoice/filter?user=" +
            this.selectedDelegate +
            "&dateRangeFrom=" +
            this.from +
            "&dateRangeTo=" +
            this.to +
            "&type=3"
        )
        .then((res) => {
          this.restores = res.data;
          this.allRestores = res.data;
        });
      this.$http
        .get(
          this.$baseUrl +
            "damagedInvoice/userDateRange/" +
            this.selectedDelegate +
            "?from=" +
            this.from +
            "&to=" +
            this.to
        )
        .then((res) => {
          this.damaged = res.data;
          this.allDamaged = res.data;
        });

      this.$http
        .get(this.$baseUrl + "customer/user/" + this.selectedDelegate)
        .then((res) => {
          this.customers = res.data;
          this.allCustomers = res.data;
          this.filterData(dayname);
        });
    },
    filterData(day) {
      let customerDay = day;
      day = this.capitalizeFirstLetter(day);
      if (day == "All") {
        this.invoices = this.allInvoices;
        this.restores = this.allRestores;
        this.damaged = this.allDamaged;
        this.visits = this.allVisits;
        this.customers = this.allCustomers;
      } else {
        this.invoices = this.allInvoices.filter(
          (x) => x.creationDayName == day
        );
        this.restores = this.allRestores.filter(
          (x) => x.creationDayName == day
        );
        this.damaged = this.allDamaged.filter((x) => x.creationDayName == day);
        this.visits = this.allVisits.filter((x) => x.creationDayName == day);
        this.customers = this.allCustomers.filter(
          (x) => x.visitDay == customerDay || x.secondVisitDay == customerDay
        );
      }
    },
    capitalizeFirstLetter(string) {
      return string.charAt(0).toUpperCase() + string.slice(1);
    },
    getNumberOfWeekDays(dayNum) {
      let start = new Date(this.from);
      let end = new Date(this.to);
      // Sunday's num is 0 with Date.prototype.getDay.
      dayNum = dayNum || 0;
      // Calculate the number of days between start and end.
      var daysInInterval = Math.ceil(
        (end.getTime() - start.getTime()) / (1000 * 3600 * 24)
      );
      // Calculate the nb of days before the next target day (e.g. next Sunday after start).
      var toNextTargetDay = (7 + dayNum - start.getDay()) % 7;
      // Calculate the number of days from the first target day to the end.
      var daysFromFirstTargetDay = Math.max(
        daysInInterval - toNextTargetDay,
        0
      );
      // Calculate the number of weeks (even partial) from the first target day to the end.
      return Math.ceil(daysFromFirstTargetDay / 7);
    },
  },
};
</script>

<style scoped>
td {
  border-bottom: thin solid rgba(0,0,0,1) !important;
}
.printHeader {
  display: none !important;
}
@media print {
  .printHeader {
    display: block !important;
    padding: 10px;
  }
  .no-print {
    display: none !important;
  }
  @page {
    size: A4 portrait;
  }
  * {
    direction: rtl !important;
    color-adjust: exact !important;

  }
  .v-btn {
    display: none !important;
  }
  .v-card {
    box-shadow: none !important;
  }
}
</style>