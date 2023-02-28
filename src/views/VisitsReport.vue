<template>
  <div class="pa-10" id="visitsreport">
    <v-app-bar app>
      <v-toolbar-title>الزيارات</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>
    <v-card class="pa-10">
      <v-row>
        <v-col>
          <v-autocomplete
            outlined
            dense
            hide-details
            label="سبب الزيارة"
            v-model="selectedVisitCause"
            :items="visitCauses"
            item-value="idVisitCause"
            item-text="visitCauseName"
          ></v-autocomplete>
        </v-col>
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
          <v-btn @click="search()" color="primary" block dark> بحث </v-btn>
        </v-col>
      </v-row>
      <br />
      <hr />
      <br />
      <v-simple-table>
        <thead>
          <tr>
            <th>اسم الزبون</th>
            <th>اسم المندوب</th>
            <th>الوقت</th>
            <th>سبب الزيارة</th>
            <th>الاجراءات</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="visit in visits" :key="visit.idVisit">
            <td>{{ visit.storeName }} - {{ visit.customerId }}</td>
            <td>{{ visit.username }}</td>
            <td>
              {{
                startDate == endDate
                  ? visit.creationFixedDate
                      .replace("AM", "ص")
                      .replace("PM", "م")
                      .replace(startDate, "")
                      .replace(endDate, "")
                  : visit.creationFixedDate
                      .replace("AM", "ص")
                      .replace("PM", "م")
              }}
            </td>
            <td>{{ visit.visitCauseName }}</td>
            <td>
              <v-btn
                small
                color="primary"
                v-if="visit.idVisit != undefined"
                @click="setMarker(visit)"
                >الخريطة</v-btn
              >
            </td>
          </tr>
        </tbody>
      </v-simple-table>
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
// import * as moment from "moment";

export default {
  data: () => ({
    visitCauses: [],
    mapDialog: false,
    visits: [],
    startDate: null,
    selectedVisitCause: null,
    endDate: null,
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
  created: function () {
    // LOAD PERMS END
    this.getCurrentDate().then((value) => {
      this.startDate = value;
      this.endDate = value;
      this.fetch();
    });
  },
  methods: {
    fetch() {
      this.search();
      this.$http.get(this.$baseUrl + "visitCauses").then((res) => {
        this.visitCauses = res.data;
      });
    },
    search() {
      let loading = this.$loading.show();
      let q = "";
      if (this.selectedVisitCause != null) {
        q = q + "&visitCauseId=" + this.selectedVisitCause;
      }
      this.$http
        .get(
          this.$baseUrl +
            `visit?dateRangeFrom=${this.startDate}&dateRangeTo=${this.endDate}${q}`
        )
        .then((res) => {
          this.visits = res.data;
          console.log(this.visits);
        })
        .finally(() => loading.hide());
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
  },
};
</script>

<style>
</style>