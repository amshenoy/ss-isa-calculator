# Stocks & Shares ISA Annual Fee Calculator

The dashboard calculates the total annual cost by calculating the annual holding cost and monthly transaction cost for both mutual funds ("funds") and ETIs ("stocks") for various ISA providers as the holding value varies.


Theoretically the best scenario is to have 2 separate ISA providers, one for funds and one for stocks as some providers offer zero transaction cost for funds while others offer low transaction cost for stocks.
However according to ISA rules, this would mean that one of the 2 must be inactive, ie. either only funds or only stocks can be purchased in that year but not both!

Hence for a given portfolio value and a static number of monthly transactions, there exists a "best" provider in the short-term. Note that long-term, we would expect our portfolio value to increase and hence holding cost should take precedence (over transaction cost) depending on the total value of the portfolio in the future.
Transferring holdings between providers is possible but this is usually expensive. Nonetheless calculation could be done to find the best short-term to long-term switch given that we start and end with 2 different portfolio values.

[View app here](https://amshenoy.github.io/ss-isa-calculator)
