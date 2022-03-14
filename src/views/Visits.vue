<template>
  <div id="visits" class="pa-10">
    <v-app-bar app>
      <v-toolbar-title>كشف المسار</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>

    <v-card class="pa-10">
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
          <v-text-field dense v-model="from" outlined label="من" type="date">
          </v-text-field>
        </v-col>
        <v-col>
          <v-text-field dense v-model="to" outlined label="الى" type="date">
          </v-text-field>
        </v-col>
        <v-col cols="2">
          <v-btn block @click="selectDelegate()" color="primary"> بحث </v-btn>
        </v-col>
        <v-col cols="12">
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
        </v-col>
        <v-col>
          <h3>
            المبيعات :
            {{
              invoices.reduce((a, b) => a + b.totalPrice, 0).toLocaleString()
            }}
          </h3>
        </v-col>
        <v-col>
          <h3>
            الراجع :
            {{
              restores.reduce((a, b) => a + b.totalPrice, 0).toLocaleString()
            }}
          </h3>
        </v-col>
        <v-col>
          <h3>
            التالف :
            {{ damaged.reduce((a, b) => a + b.total, 0).toLocaleString() }}
          </h3>
        </v-col>
        <v-col>
          <h3>
            الزبائن :
            {{ customers.length }}
          </h3>
        </v-col>
        <v-col>
          <h3>
            تم زيارتهم :
            {{ visits.length }}
          </h3>
        </v-col>
      </v-row>
      <br />
      <v-divider></v-divider>

      <v-row>
        <v-col cols="6">
          <h4>فواتير البيع</h4>
          <br />
          <v-data-table
            :items-per-page="300"
            :items="invoices"
            :headers="invoicesTableHeaders"
            hide-default-footer
            height="300"
          >
          </v-data-table>
        </v-col>
        <v-divider vertical></v-divider>

        <v-col cols="6">
          <h4>فواتير الراجع</h4>
          <br />

          <v-data-table
            :items-per-page="300"
            :items="restores"
            :headers="restoresTableHeaders"
            hide-default-footer
            height="300"
          >
          </v-data-table>
        </v-col>
        <v-divider vertical></v-divider>
        <v-col cols="6">
          <h4>فواتير التالف</h4>
          <br />

          <v-data-table
            :items-per-page="300"
            :items="damaged"
            :headers="damagedTableHeaders"
            hide-default-footer
            height="300"
          >
          </v-data-table>
        </v-col>
        <v-divider vertical></v-divider>
        <v-col cols="6">
          <h4>الزيارات</h4>
          <br />

          <v-data-table
            :items-per-page="300"
            :items="visits"
            :headers="tableHeaders"
            hide-default-footer
            height="300"
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
    mapDialog: false,
    delegates: [],
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
    selectedDay: 0,
    tableHeaders: [
      { text: "الزبون", value: "storeName" },
      { text: "بتاريخ", value: "creationFixedDate" },
      { text: "الاجراءات", value: "actions" },
    ],
    invoicesTableHeaders: [
      { text: "الزبون", value: "customerName" },
      { text: "بتاريخ", value: "creationFixedDate" },
      { text: "الوقت", value: "creationFixedTime" },
      { text: "المبلغ", value: "totalPrice" },
    ],
    restoresTableHeaders: [
      { text: "الزبون", value: "customerName" },
      { text: "بتاريخ", value: "creationFixedDate" },
      { text: "الوقت", value: "creationFixedTime" },
      { text: "المبلغ", value: "totalPrice" },
    ],
    damagedTableHeaders: [
      { text: "الزبون", value: "customerName" },
      { text: "بتاريخ", value: "creationFixedDate" },
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
    fetch: function () {
      this.$http.get(this.$baseUrl + "users/role/4").then((res) => {
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
      let loading = this.$loading.show();
      this.$http
        .get(
          this.$baseUrl +
            "visit/user/" +
            this.selectedDelegate +
            "?dateFrom=" +
            this.from +
            "&dateTo=" +
            this.to
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
        this.customers = this.allCustomers.filter((x) => x.visitDay == customerDay || x.secondVisitDay == customerDay)
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

<style>
</style>