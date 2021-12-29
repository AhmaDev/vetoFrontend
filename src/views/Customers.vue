<template>
  <div class="pa-5" id="customersPage">
    <v-row>
      <v-col cols="3">
        <v-card
          style="overflow-y: scroll"
          height="85vh"
          class="pa-0"
          no-elevation
        >
          <v-app-bar absolute style="position: sticky">
            <v-text-field
              @keyup="filterCustomers($event)"
              solo
              dense
              hide-details
              label="ابحث"
            ></v-text-field>

            <template v-slot:extension>
              <v-tabs v-model="selectedTab" fixed-tabs>
                <v-tabs-slider></v-tabs-slider>
                <v-tab>الزبائن</v-tab>
                <v-tab>الموردين</v-tab>
              </v-tabs>
            </template>

          </v-app-bar>
          <v-list nav dense>
   
              <v-list-item active-class="selectedCustomer"  @click="selectCustomer(customer.idCustomer)" v-for="(customer, i) in getData()" :key="i">
                <v-list-item-icon>
                  <v-icon>mdi-account</v-icon>
                </v-list-item-icon>
                <v-list-item-content>
                  <v-list-item-title>
                    {{ customer.storeName }} - {{ customer.idCustomer }}
                  </v-list-item-title>
                </v-list-item-content>
              </v-list-item>

          </v-list>
        </v-card>
      </v-col>
      <v-col cols="9">
        <v-card
          style="overflow-y: scroll"
          height="85vh"
          class="pa-5"
          no-elevation
        >
          <Customer v-if="selectedTab == 0" :customerId="customerId" />
          <Manufacture v-if="selectedTab == 1" :customerId="customerId" />
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import Customer from "@/components/Customer.vue";
import Manufacture from "@/components/Manufacture.vue";
export default {
  name: "CustomersPage",
  components: {
    Customer,
    Manufacture,
  },
  data: () => ({
    customers: [],
    manufactures: [],
    allCustomers: [],
    selectedTab: 0,
    customerId: null,
    selectedCustomer: null,
  }),
  created: function () {
    this.fetch();
  },
  methods: {
    fetch() {
      let loading = this.$loading.show();
      this.$http
        .get(this.$baseUrl + "customer")
        .then((res) => {
          this.customers = res.data;
          this.allCustomers = res.data;
        })
        .finally(() => loading.hide());
      this.$http.get(this.$baseUrl + "manufacture").then((res) => {
        this.manufactures = res.data;
      });
    },
    selectCustomer(id) {
      this.customerId = id;
    },
    filterCustomers(e) {
      console.log(e);
      this.customers = this.allCustomers.filter(
        (customer) =>
          customer.storeName.includes(e.target.value) ||
          customer.idCustomer == e.target.value
      );
    },
    getData() {
      if (this.selectedTab == 0) {
        return this.customers;
      } else {
        return this.manufactures;
      }
    }
  },
};
</script>

<style>

</style>