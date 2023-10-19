//References:
// https://github.com/nicolaspanel/numjs/blob/master/src/ndarray.js
// https://github.com/nicolaspanel/numjs
// https://github.com/scijs/ndarray-ops


// Stocks and Shares ISA Providers
/*
> a.slice([null,null,-1]) // same as a[::-1]
    array([ 4, 3, 2, 1, 0])
*/

var INF = Number.MAX_SAFE_INTEGER;
var gt0 = x => x > 0 ? 1 : 0;
var gte0 = x => x >= 0 ? 1 : 0;
var lt0 = x => x < 0 ? 1 : 0;
var lte0 = x => x <= 0 ? 1 : 0;
var nanfilter = x => Math.abs(x) > INF / 2 ? 0 : x;

//TEST: nj.subtract([2,3,4], [4,3,2]).apply(gte0)

nj.NdArray.prototype.apply = function (func, copy) {
    if (arguments.length === 2) { copy = true; }
    var arr = copy ? this.clone() : this;
    arr.selection.data = arr.selection.data.map(x => func(x))
    return arr;
};


nj.NdArray.prototype.nansum = function (copy) {
    if (arguments.length === 1) { copy = true; }
    var arr = copy ? this.clone() : this;
    return arr.apply(nanfilter).sum();
}
//nj.NdArray.prototype.nansum = nj.NdArray.prototype.apply(nanfilter).sum() // Simpler form if it works (needs to be corrected)

//TEST: nj.subtract([2,3,4], [3,1,Number.MAX_SAFE_INTEGER]).nansum()

/*
nj.NdArray.prototype.geq = function (value, copy) {
  if (arguments.length === 1) { copy = true; }
  var arr = copy ? this.clone() : this;
  ops.geq(arr.selection, value);
  return arr;
};
*/

function tier_sum(tiers, charges, value) {
    tiers = nj.array(tiers)
    charges = nj.array(charges)
    var ends = tiers.slice(1)
    var starts = tiers.slice([0, -1])

    var a = ends.subtract(value).apply(gte0)
    var b = starts.subtract(value).apply(lt0)
    var c = starts.subtract(value).negative()
    var A = (a.multiply(b)).multiply(c)
    var B = (ends.subtract(value).apply(lt0)).multiply(ends.subtract(starts))
    return charges.multiply(A.add(B)).nansum()
}

// https://www.hl.co.uk/investment-services/isa/savings-interest-rates-and-charges
function HL(F, S, Nf, Ns) {
    var tiers = [0, 250e3, 500e3, 1000e3, 2000e3, INF]
    var charges = nj.array([0.45, 0.25, 0.25, 0.1, 0]).divide(100)

    var share_trans_tiers = [0, 10, 20, INF]
    var fund_trans_cost = 0
    var share_trans_cost = [11.95, 8.95, 5.95]

    var holding_cost = tier_sum(tiers, charges, F) + Math.min(S * 0.45 / 100, 45)
    var trans_cost = (Nf * fund_trans_cost + tier_sum(share_trans_tiers, share_trans_cost, Ns)) * 12

    return holding_cost + trans_cost
}

// https://www.ajbell.co.uk/faq/what-are-charges-my-stocks-and-shares-isa
function AJB(F, S, Nf, Ns) {
    var tiers = [0, 250e3, 1000e3, 2000e3, INF]
    var fund_charges = nj.array([0.25, 0.1, 0.05, 0]).divide(100)

    var share_trans_tiers = [0, 10, 20, INF]
    var fund_trans_cost = 1.5
    var share_trans_cost = [9.95, 4.95, 4.95]

    var holding_cost = tier_sum(tiers, fund_charges, F) + Math.min(S * 0.25 / 100, 3.5 * 12)
    var trans_cost = (Nf * fund_trans_cost + tier_sum(share_trans_tiers, share_trans_cost, Ns)) * 12

    return holding_cost + trans_cost
}


function BARC(F, S, Nf, Ns) {
    var V = F + S

    var fund_charge = 0.2 / 100
    var share_charge = 0.1 / 100

    var fund_trans_cost = 3
    var share_trans_cost = 6

    var holding_cost = Math.max(Math.min(fund_charge * F + share_charge * S, 125 * 12), 4 * 12)
    var trans_cost = (Nf * fund_trans_cost + Ns * share_trans_cost) * 12

    return holding_cost + trans_cost
}


// Verified using https://www.fidelity.co.uk/fees-calculator/
function FID(F, S, Nf, Ns) {

    var tiers = nj.array([250e3, 500e3, 1000e3])
    var charges = [0.35 / 100, 0.2 / 100, 0.2 / 100] //nj.array([0.35, 0.2, 0.2]).divide(100).tolist()

    // Fidelity charges the rate on the amount for the tier you are in rather than on the amount over the previous tier
    // For ETIs (Exchange-traded instrs eg. stocks, ETFs), the fee is capped at 45 annually
    // But for Mutual Funds, this is capped at 2000 annually
    var holding_cost = Math.min(F * charges[tiers.subtract(F).apply(lte0).sum()], 2000) + Math.min(S * charges[tiers.subtract(S).apply(lte0).sum()], 45)

    var instr_trans_cost = 10
    //var trans_cost = ((Nf + Ns)*instr_trans_cost)*12
    var trans_cost = (Ns * instr_trans_cost) * 12
    return holding_cost + trans_cost
}

// https://www.ii.co.uk/ii-accounts/isa/isa-charges
function II(F, S, Nf, Ns) {
    var V = F + S

    var monthly_free_trans = V < 50000 ? 0 : 1
    var instr_trans_cost = 3.99

    var holding_cost = V < 50000 ? 4.99 * 12 : 11.99 * 12
    var trans_cost = instr_trans_cost * Math.max(Nf + Ns - monthly_free_trans, 0) * 12

    return holding_cost + trans_cost
}


function MIN(f, s, Nf, Ns) {
    var providers = [HL, AJB, BARC, FID, II]
    var arr = []
    for (let [i, provider] of providers.entries()) {
        arr.push(provider(f, s, Nf, Ns))
    }
    return Math.min(...arr)
}
