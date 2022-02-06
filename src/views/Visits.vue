<template>
  <div id="visits" class="pa-10">
    <v-app-bar app>
      <v-toolbar-title>الزيارات</v-toolbar-title>
      <v-spacer></v-spacer>
    </v-app-bar>

    <v-card>
      <v-data-table
        :items-per-page="30"
        :items="visits"
        :headers="tableHeaders"
      >
        <template v-slot:top>
          <div class="px-10 py-5">
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
                <v-text-field
                  dense
                  v-model="selectedDate"
                  outlined
                  label="التاريخ"
                  type="date"
                >
                </v-text-field>
              </v-col>
              <v-col cols="2">
                <v-btn block @click="selectDelegate()" color="primary">
                  بحث
                </v-btn>
              </v-col>
            </v-row>
          </div>
        </template>
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
    selectedDate: "",
    visits: [],
    tableHeaders: [
      { text: "المندوب", value: "username" },
      { text: "الزبون", value: "storeName" },
      { text: "بتاريخ", value: "creatredAt" },
      { text: "سبب الزيارة", value: "visitCauseName" },
      { text: "الاجراءات", value: "actions" },
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
      this.selectedDate = value;
    });
    this.fetch();
  },
  methods: {
    fetch: function () {
      let loading = this.$loading.show();
      this.$http.get(this.$baseUrl + "visit").then((res) => {
        this.visits = res.data;
        loading.hide();
      });
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
            "?date=" +
            this.selectedDate
        )
        .then((res) => {
          this.visits = res.data;
        })
        .finally(() => loading.hide());
    },
  },
};
</script>

<style>
</style>