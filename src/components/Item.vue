<template>
  <div id="itemPage" class="pa-10">
    <v-app-bar app>
      <v-toolbar-title v-if="item != null">{{ item.itemName }}</v-toolbar-title>

      <v-spacer></v-spacer>

      <v-btn @click="save()" icon>
        <v-icon>mdi-check</v-icon>
      </v-btn>
    </v-app-bar>

    <v-card v-if="item != null" class="pa-10" no-elevation>
      <v-row>
        <v-col cols="4">
          <v-text-field
            label="اسم المادة"
            outlined
            hide-details
            notdense
            v-model="item.itemName"
          ></v-text-field>
        </v-col>
        <v-col cols="4">
          <v-text-field
            label="رمز المادة"
            outlined
            hide-details
            notdense
            v-model="item.itemCode"
          ></v-text-field>
        </v-col>
        <v-col cols="4">
          <v-text-field
            label="باركود"
            outlined
            hide-details
            notdense
            v-model="item.itemBarcode"
            type="number"
          ></v-text-field>
        </v-col>
        <v-col cols="4">
          <v-autocomplete
            v-model="item.itemGroupId"
            :items="groups"
            outlined
            hide-details
            notdense
            label="المجموعة"
            item-text="itemGroupName"
            item-value="idItemGroup"
          ></v-autocomplete>
        </v-col>
        <v-col cols="8">
          <v-text-field
            label="وصف المادة"
            outlined
            hide-details
            notdense
            v-model="item.itemDescription"
          ></v-text-field>
        </v-col>
        <v-col cols="4">
          <v-autocomplete
            v-model="item.manufactureId"
            :items="groups"
            outlined
            hide-details
            notdense
            label="الشركة الموردة"
            item-text="itemGroupName"
            item-value="idItemGroup"
          ></v-autocomplete>
        </v-col>
        <v-col cols="4">
          <v-autocomplete
            v-model="item.itemTypeId"
            :items="groups"
            outlined
            hide-details
            notdense
            label="نوع المادة"
            item-text="itemGroupName"
            item-value="idItemGroup"
          ></v-autocomplete>
        </v-col>

        <v-col cols="2">
          <v-text-field
            label="عرض الكارتون"
            type="number"
            outlined
            hide-details
            notdense
            v-model="item.cartonWidth"
          ></v-text-field>
        </v-col>

        <v-col cols="2">
          <v-text-field
            label="ارتفاع الكارتون"
            type="number"
            outlined
            hide-details
            notdense
            v-model="item.cartonHeight"
          ></v-text-field>
        </v-col>

        <v-col cols="2">
          <v-text-field
            label="طول الكارتون"
            type="number"
            outlined
            hide-details
            notdense
            v-model="item.cartonLength"
          ></v-text-field>
        </v-col>

        <v-col cols="2">
          <v-text-field
            label="وزن الكارتون"
            type="number"
            outlined
            hide-details
            notdense
            v-model="item.itemWeight"
          ></v-text-field>
        </v-col>

        <v-col cols="2">
          <v-text-field
            label="عدد القطع في الكارتون"
            type="number"
            outlined
            hide-details
            notdense
            v-model="item.cartonQauntity"
          ></v-text-field>
        </v-col>

        <v-col cols="2">
          <v-text-field
            label="عدد ايام صلاحية المادة"
            type="number"
            outlined
            hide-details
            notdense
            v-model="item.expireAge"
          ></v-text-field>
        </v-col>

        <v-col cols="2">
          <v-text-field
            label="الحد الادنى للتنبيه"
            type="number"
            hint="العدد بالكراتين"
            outlined
            notdense
            v-model="item.minimumStoreNotify"
          ></v-text-field>
        </v-col>

        <v-col cols="2">
          <v-text-field
            label="الحد الاعلى للتنبيه"
            type="number"
            hint="العدد بالكراتين"
            outlined
            notdense
            v-model="item.maximumStoreNotify"
          ></v-text-field>
        </v-col>

        <v-col cols="2">
          <v-switch
            v-model="item.isAvailable"
            label="متاح للبيع"
            inset
          ></v-switch>
        </v-col>
        <v-col cols="4">
          <v-btn onclick="document.getElementById('filepicker').click()" block>
            <v-icon> mdi-cloud-outline </v-icon>
            &nbsp;&nbsp; تعديل صورة المادة
          </v-btn>
          <input
            id="filepicker"
            style="display: none"
            type="file"
            name="uploads"
            @change="selectFiles($event)"
            accept="image/png, image/gif, image/jpeg"
          />
          <img
            v-if="item.imagePath != null"
            :src="$baseUrl + 'files/' + item.imagePath"
            width="100%"
            id="imagePath"
          />
          <img
            v-if="item.imagePath == null"
            src="@/assets/no_image_placeholder.png"
            width="100%"
            id="imagePath"
          />
        </v-col>
        <v-col cols="6">
          <v-data-table
            :headers="pricesHeader"
            :items="item.prices"
            :items-per-page="100"
            class="elevation-1"
          >
            <template v-slot:top>
              <v-menu offset-y>
                <template v-slot:activator="{ attrs, on }">
                  <v-btn color="primary" v-bind="attrs" v-on="on">
                    اضافة سعر جديد
                  </v-btn>
                </template>

                <v-list>
                  <v-list-item
                    v-for="sellPrice in sellPrices"
                    :key="sellPrice.idSellPrice"
                    link
                    @click="addNewSellPrice(sellPrice.idSellPrice)"
                  >
                    <v-list-item-title
                      v-text="sellPrice.sellPriceName"
                    ></v-list-item-title>
                  </v-list-item>
                </v-list>
              </v-menu>
            </template>
            <template v-slot:[`item.price`]="{ item }">
              <v-text-field
                @change="updatePrice(item.idItemPrice, $event)"
                :value="item.price"
              ></v-text-field>
            </template>

            <template v-slot:[`item.delegateTarget`]="{ item }">
              <v-text-field
                @change="updateDelegateTarget(item.idItemPrice, $event)"
                :value="item.delegateTarget"
              ></v-text-field>
            </template>
          </v-data-table>
        </v-col>
      </v-row>
    </v-card>
  </div>
</template>

<script>
export default {
  name: "Item",
  groups: [],
  data: () => ({
    permissions: [],
    sellPrices: [],
    itemId: 0,
    item: null,
    image: null,
    pricesHeader: [
      { text: "السعر", value: "sellPriceName" },
      { text: "المبلغ", value: "price" },
      { text: "الهدف اليومي للمندوب", value: "delegateTarget" },
    ],
  }),
  created: function () {
    // LOAD PERMS START
    this.auth().then((res) => {
      this.permissions = res.permissions;
      // CHECK IF CAN SEE THIS PAGE
      if (!this.checkPermission("items_edit")) {
        this.$toast.open({
          type: "error",
          message: "غير مصرح لك بمشاهدة هذه الصفحة",
          duration: 3000,
        });
        this.$router.go(-1);
      }
    });
    // LOAD PERMS END
    this.fetch();
  },
  methods: {
    fetch() {
      this.itemId = this.$route.params.id;
      let loading = this.$loading.show();
      this.$http
        .get(this.$baseUrl + "itemgroup")
        .then((res) => {
          this.groups = res.data;
          this.$http
            .get(this.$baseUrl + "item/" + this.itemId)
            .then((res) => {
              this.item = res.data;
            })
            .finally(() => {
              loading.hide();
            });
        })
        .finally(() => {});
      this.$http
        .get(this.$baseUrl + "sellprice")
        .then((res) => {
          this.sellPrices = res.data;
        })
        .finally(() => {});
    },
    checkPermission(permissionKey) {
      var isAuthorized = this.permissions.filter(
        (p) => p.permissionKey == permissionKey
      );
      if (isAuthorized.length > 0) return true;
      else return false;
    },
    updatePrice(id, value) {
      let loading = this.$loading.show();
      this.$http
        .put(this.$baseUrl + "item/updatePrice/" + id, { price: value })
        .then((res) => {
          console.log(res.data);
          this.$toast.open({
            type: "success",
            message: "تم تعديل السعر بنجاح",
            duration: 3000,
          });
        })
        .finally(() => loading.hide());
    },
    updateDelegateTarget(id, value) {
      let loading = this.$loading.show();
      this.$http
        .put(this.$baseUrl + "item/updatePrice/" + id, {
          delegateTarget: value,
        })
        .then((res) => {
          console.log(res.data);
          this.$toast.open({
            type: "success",
            message: "تم تعديل هدف المندوب",
            duration: 3000,
          });
        })
        .finally(() => loading.hide());
    },
    selectFiles(e) {
      var files = e.target.files || e.dataTransfer.files;
      if (!files.length) return;
      for (let i = 0; i < files.length; i++) {
        this.image = files[i];
      }
      let loading = this.$loading.show();
      let formData = new FormData();
      formData.append("itemImage", this.image);
      this.$http
        .put(this.$baseUrl + "item/updateImage/" + this.itemId, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        })
        .then((res) => {
          console.log(res.data);
          this.$toast.open({
            type: "success",
            message: " تم تغيير الصورة",
            duration: 3000,
          });
          document
            .getElementById("imagePath")
            .setAttribute("src", URL.createObjectURL(this.image));
        })
        .finally(() => loading.hide());
    },
    save() {
      let loading = this.$loading.show();
      this.$http
        .put(this.$baseUrl + "item/edit/" + this.itemId, {
          itemName: this.item.itemName,
          itemCode: this.item.itemCode,
          itemBarcode: this.item.itemBarcode,
          itemGroupId: this.item.itemGroupId,
          itemDescription: this.item.itemDescription,
          isAvailable: this.item.isAvailable,
          manufactureId: this.item.manufactureId,
          itemTypeId: this.item.itemTypeId,
          cartonWidth: this.item.cartonWidth,
          cartonHeight: this.item.cartonHeight,
          cartonLength: this.item.cartonLength,
          cartonQauntity: this.item.cartonQauntity,
          expireAge: this.item.expireAge,
          maximumStoreNotify: this.item.maximumStoreNotify,
          minimumStoreNotify: this.item.minimumStoreNotify,
          itemWeight: this.item.itemWeight,
        })
        .then((res) => {
          console.log(res.data);
          this.$toast.open({
            type: "success",
            message: " تم تحديث معلومات المادة بنجاح",
            duration: 3000,
          });
        })
        .finally(() => loading.hide());
    },
    addNewSellPrice(id) {
      let loading = this.$loading.show();
      this.$http
        .post(this.$baseUrl + "item/itemPrice/new", {
          itemId: this.itemId,
          sellPriceId: id,
          price: 0,
          delegateTarget: 0,
        }).then(() => {
          this.fetch();
        })
        .catch(() => {
          this.$toast.open({
            type: "error",
            message: " سعر المادة موجود مسبقاً",
            duration: 3000,
          });
        })
        .finally(() => loading.hide());
    },
  },
};
</script>

<style>
</style>