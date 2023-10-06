<template>
    <div id="packages">
        <v-app-bar app>
            <v-toolbar-title>باقات العروض</v-toolbar-title>
            <v-spacer></v-spacer>
            <v-btn-toggle color="primary" v-model="filterBySellPrice" mandatory>
                <v-btn :value="0">الكل</v-btn>
                <v-btn v-for="sellPrice in sellPrices" :key="sellPrice.idSellPrice" :value="sellPrice.idSellPrice">
                    {{ sellPrice.sellPriceName }}
                    <v-chip class="mr-1" small>
                        {{ packages.filter(e => e.sellPriceId == sellPrice.idSellPrice).length }}
                    </v-chip>
                </v-btn>
            </v-btn-toggle>
            <v-spacer></v-spacer>
            <v-btn @click="resetForm(); addPackageModal = true" color="success">
                <span>اضافة باقة جديدة</span>
            </v-btn>
        </v-app-bar>
        <div id="contents" class="pa-10">
            <v-row>
                <v-col cols="3"
                    v-for="p in filterBySellPrice == 0 ? packages : packages.filter(e => e.sellPriceId == filterBySellPrice)"
                    :key="p.idPackage">
                    <v-card class="pa-3">
                        <v-list subheader>
                            <v-subheader>سعر البيع : {{
                                sellPrices.filter(e => e.idSellPrice == p.sellPriceId)[0].sellPriceName }}</v-subheader>

                            <v-list-item v-for="item in p.items" :key="item.idPackageItem">
                                <v-list-item-avatar>
                                    <v-img
                                        :src="$baseUrl + 'files/' + items.filter(e => e.idItem == item.itemId)[0].imagePath"></v-img>
                                </v-list-item-avatar>

                                <v-list-item-content>
                                    <v-list-item-title>
                                        {{ items.filter(e => e.idItem == item.itemId)[0].fullItemName }}</v-list-item-title>
                                </v-list-item-content>

                                <v-list-item-icon>
                                    <b>{{ item.discountTypeId == 0 ? item.count : "مجاني" }}</b>
                                </v-list-item-icon>
                            </v-list-item>
                        </v-list>
                        <v-divider></v-divider>
                        <v-btn block class="mt-3" elevation="0" @click="deletePackage(p.idPackage)" color="error">حذف
                            الباقة</v-btn>
                    </v-card>
                </v-col>
            </v-row>
        </div>
        <v-dialog v-model="addPackageModal" :max-width="1000">
            <v-card class="pa-10">
                <br>
                <v-autocomplete :disabled="addPackageForm.items.length > 0" hide-details dense :items="sellPrices"
                    label="سعر البيع" item-text="sellPriceName" item-value="idSellPrice" outlined
                    v-model="addPackageForm.sellPriceId"></v-autocomplete>
                <br>
                <v-row v-if="addPackageForm.sellPriceId != 0" align="center">
                    <v-col>
                        <v-autocomplete hide-details dense :items="items" label="قم باختيار مادة" item-text="fullItemName"
                            item-value="idItem" outlined v-model="addPackageForm.selectedItem"></v-autocomplete>
                    </v-col>
                    <v-col cols="3">
                        <v-text-field hide-details dense outlined v-model="addPackageForm.selectedItemCount" label="الكمية"
                            type="number"></v-text-field>
                    </v-col>
                    <v-col cols="auto">
                        <v-btn @click="addItemToPackage()" color="primary">اضافة</v-btn>
                    </v-col>
                </v-row>
                <br>
                <v-simple-table v-if="addPackageForm.items.length > 0" dense class="elevation-3">
                    <thead class="grey lighten-1">
                        <tr>
                            <td>المادة</td>
                            <td>الكمية</td>
                            <td>السعر</td>
                            <td>المجموع</td>
                            <td>عرض</td>
                        </tr>
                    </thead>
                    <tbody>
                        <tr v-for="(item, i) in addPackageForm.items" :key="item.itemId">
                            <td>
                                {{ items.filter(e => e.idItem == item.itemId)[0].fullItemName }}
                            </td>
                            <td>{{ item.count }}</td>
                            <td>{{ item.price.toLocaleString() }}</td>
                            <td v-if="!addPackageForm.items[i].isGift">{{ (item.count * item.price).toLocaleString() }}</td>
                            <td v-if="addPackageForm.items[i].isGift">مجاني</td>
                            <td>
                                <v-checkbox :true-value="true" :false-value="false"
                                    v-model="addPackageForm.items[i].isGift"></v-checkbox>
                            </td>
                        </tr>
                    </tbody>
                </v-simple-table>
                <br>
                <v-btn v-if="addPackageForm.items.length > 0" @click="addPackage()" color="success" block>اضافة
                    الباقة</v-btn>
            </v-card>
        </v-dialog>
    </div>
</template>

<script>
export default {
    data: () => ({
        filterBySellPrice: 0,
        packages: [],
        addPackageModal: false,
        sellPrices: [],
        items: [],
        addPackageForm: {
            sellPriceId: 0,
            selectedItem: 0,
            selectedItemCount: null,
            items: [],
        }

    }),
    created: function () {
        this.fetch();
    },
    methods: {
        async fetch() {
            let loading = this.$loading.show();
            this.$http
                .get(this.$baseUrl + "package").then(res => {
                    this.packages = res.data;
                }).finally(() => loading.hide());
            this.$http
                .get(this.$baseUrl + "item").then(res => {
                    this.items = res.data;
                });
            this.$http
                .get(this.$baseUrl + "sellPrice").then(res => {
                    this.sellPrices = res.data;
                });
        },
        addItemToPackage() {
            if (this.addPackageForm.selectedItem != 0) {
                this.addPackageForm.items.push({
                    itemId: this.addPackageForm.selectedItem,
                    count: this.addPackageForm.selectedItemCount,
                    price: this.items.filter(e => e.idItem == this.addPackageForm.selectedItem)[0].prices.filter(p => p.sellPriceId == this.addPackageForm.sellPriceId)[0].price,
                    isGift: false,
                });
            }
            this.addPackageForm.selectedItem = 0;
            this.addPackageForm.selectedItemCount = null;
        },
        addPackage() {
            let loading = this.$loading.show();
            this.$http.post(this.$baseUrl + "package/addPackage", {
                package: {
                    sellPriceId: this.addPackageForm.sellPriceId,
                },
                items: this.addPackageForm.items,
            }).then(res => {
                console.log(res.data);
                this.addPackageForm.items = [];
                this.addPackageForm.sellPriceId = 0;
                this.addPackageModal = false;
                this.fetch();
            }).finally(() => loading.hide());
        },
        resetForm() {
            this.addPackageForm = {
                sellPriceId: 0,
                selectedItem: 0,
                selectedItemCount: null,
                items: [],
            };
        },
        deletePackage(id) {
            let c = confirm("هل انت متاكد من حذف الباقة");
            if (c) {
                let loading = this.$loading.show();
                this.$http.delete(this.$baseUrl + "package/delete/" + id).then(() => this.fetch()).finally(() => loading.hide());
            }
        }
    }
}
</script>

<style></style>